//api/workspace/[id]/route.ts

import { streamText,embed } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { serverContainer } from '@/src/config/inversify.config';
import { TYPES } from '@/src/config/types';
import { VaultMessagesController } from '@/src/controllers/VaultMessagesController';
import { RedisContextController } from '@/src/controllers/RedisContextController';
import { PineconeVaultController } from '@/src/controllers/PineconeVaultController';
import { chartTool } from '@/lib/tools/chartGenerator';
import { economicIndicatorTool } from '@/lib/tools/economicIndicator';
import { economicNewsTool } from '@/lib/tools/economicNews';
import { vaultSearchTool, vaultDocumentTool } from '@/lib/tools/vaultSearch';
import { auth, Token } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';


//System Prompts
import { systemPrompt } from '@/lib/prompts/normal.prompt'
import { classicalPrompt } from '@/lib/prompts/classical.prompt';
import { keynesianPrompt } from '@/lib/prompts/keynesian.prompt';
import { marxistPrompt } from '@/lib/prompts/marxist.prompt';
import { neoclassicalPrompt } from '@/lib/prompts/neoclassical.prompt';

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}


export async function POST(req:Request,{ params}:{params:Promise<{id:string}>}) {
    try {        // Get authenticated user
        const { getToken, userId } = await auth();
        const token = await getToken()

        if (!token || !userId) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Await params to get vault ID
        const { id:vaultId } = await params;
        if (!vaultId) {
            return new Response('Vault ID is required', { status: 400 });
        }
        
        let requestBody;
        // Parse request body with validation
        try{
           requestBody = await req.json();
        }catch (error) {
           return new Response('Invalid JSON payload', { status: 400 });
        }

        const { messages, system, temperature } = requestBody;

        if (!messages || !Array.isArray(messages)) {
            return new Response('Invalid payload: messages array is required', { status: 400 });
        }

        if (messages.length === 0) {
            return new Response('Invalid payload: messages array cannot be empty', { status: 400 });
        }

        // System prompt mapping with default fallback
            const systemPrompts = {
              normal: systemPrompt,
              classical: classicalPrompt,
              keynesian: keynesianPrompt,
              marxist: marxistPrompt,
              neoclassical: neoclassicalPrompt,
            } as const;
        
            // Validate and select system prompt with fallback to normal
            type SystemPromptKey = keyof typeof systemPrompts;
            const selectedSystem: SystemPromptKey = system && system in systemPrompts ? system as SystemPromptKey : 'normal';
            const SYSTEM_PROMPT = systemPrompts[selectedSystem];            // Models
            const model = createGoogleGenerativeAI({
                apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
                })('gemini-2.0-flash', { useSearchGrounding: true });

            // Get controllers from DI container            const vaultMessagesController = serverContainer.get<VaultMessagesController>(TYPES.VaultMessagesController);
            const redisContextController = serverContainer.get<RedisContextController>(TYPES.RedisContextController);
            const pineconeVaultController = serverContainer.get<PineconeVaultController>(TYPES.PineconeVaultController);
            const vaultMessagesController = serverContainer.get<VaultMessagesController>(TYPES.VaultMessagesController);

            // Find last user message
            const userMessages = messages.filter((m: Message) => m.role === 'user');
            const lastUserMessage = userMessages[userMessages.length - 1];
    
            if (!lastUserMessage) {
            return new Response('No user message found', { status: 400 });
            }

         // Update Redis context
         await redisContextController.pushMessage(vaultId, {
          role: 'user',
          content: lastUserMessage.content,
         timestamp: new Date().toISOString()
         });

         // Persist user message  to database
            const userMessageId = uuidv4();
            await vaultMessagesController.insertMessageToVault({
              id: userMessageId,
              role: 'user',
              vault_id: vaultId,
              content: lastUserMessage.content,
              created_at: new Date().toISOString(),
            },token);            // Embed last user message and do a similarity search in Pinecone
           const userMsgEmbeddingResult = await embed({
              model: createGoogleGenerativeAI({
                apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
              }).textEmbedding('text-embedding-004'),
              value: lastUserMessage.content,           });
           
           // Query Pinecone for similar content with enhanced vault-specific filtering
           const userMsgEmbedding = userMsgEmbeddingResult.embedding;
           
           // Build comprehensive filter for efficient querying
           const pineconeFilter: Record<string, any> = {
             vault_id: { $eq: vaultId }
           };

           // Add user ID to ensure user can only access their own documents
           if (userId) {
             pineconeFilter.user_id = { $eq: userId };
           }
           
           const queryResults = await pineconeVaultController.query(
             vaultId, 
             userMsgEmbedding, 
             10, // Increased for better context
             pineconeFilter
           );
           
           // Build context from query results with improved filtering
           let contextContent = '';
           if (queryResults && queryResults.length > 0) {
             // Group chunks by document and prioritize recent, high-scoring content
             const documentGroups = new Map<string, typeof queryResults>();
             
             queryResults.forEach(result => {
               const docId = result.metadata?.document_id || 'unknown';
               if (!documentGroups.has(docId)) {
                 documentGroups.set(docId, []);
               }
               documentGroups.get(docId)!.push(result);
             });

             // Select best chunks from each document (max 2 per document)
             const selectedChunks: string[] = [];
             for (const [docId, chunks] of documentGroups) {
               const bestChunks = chunks
                 .filter(result => result.score && result.score > 0.75) // Higher threshold
                 .sort((a, b) => (b.score || 0) - (a.score || 0))
                 .slice(0, 2) // Max 2 chunks per document
                 .map(result => {
                   const fileName = result.metadata?.file_name || 'Unknown Document';
                   const text = result.metadata?.text || '';
                   return `[From: ${fileName}]\n${text}`;
                 });
               
               selectedChunks.push(...bestChunks);
             }

             if (selectedChunks.length > 0) {
               contextContent = `\n\nRelevant context from vault documents:\n${selectedChunks.join('\n\n---\n\n')}`;
             }
           }

           // Augment the last user message with context
           const augmentedMessages = [...messages];
           if (contextContent) {
             const lastMessageIndex = augmentedMessages.length - 1;
             augmentedMessages[lastMessageIndex] = {
               ...lastUserMessage,
               content: `${lastUserMessage.content}${contextContent}`
             };
           }

           console.log(`Using ${selectedSystem} economic perspective for vault ${vaultId}`);

           // Validate Google API key
           if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
             console.error('Google API key is not configured');
             return new Response('Service configuration error', { status: 500 });
           }

           // Generate AI response with augmented context
           const { textStream } = streamText({
             model,
             messages: augmentedMessages,
             system: SYSTEM_PROMPT,             tools: {
               chartTool,
               economicIndicatorTool,
               economicNewsTool,
               vaultSearchTool,
               vaultDocumentTool
             },
             temperature: temperature || 0.7,
             maxTokens: 2000,
             onFinish: async (result) => {
               try {
                 // Persist assistant message to database
                 const assistantMessageId = uuidv4();
                 await vaultMessagesController.insertMessageToVault({
                   id: assistantMessageId,
                   vault_id: vaultId,
                   role: 'assistant',
                   content: result.text,
                   created_at: new Date().toISOString()
                 }, token);

                 // Update Redis context with assistant response
                 await redisContextController.pushMessage(vaultId, {
                   role: 'assistant',
                   content: result.text,
                   timestamp: new Date().toISOString()
                 });

                 console.log(`Messages persisted for vault ${vaultId}`);
               } catch (error) {
                 console.error('Error persisting assistant message:', error);
                 // Don't throw here as the response is already streaming
               }
             }
           });

           // Return streaming response
           return new Response(
             new ReadableStream({
               async pull(controller) {
                 for await (const chunk of textStream) {
                   controller.enqueue(chunk);
                 }
                 controller.close();
               }
             }),
             {
               headers: {
                 'Content-Type': 'text/plain; charset=utf-8',
                 'Cache-Control': 'no-cache',
                 'Connection': 'keep-alive',
               },
             }
           );

    } catch (error) {
        console.error('Error in vault chat handler:', error);
        
        // Return appropriate error response
        if (error instanceof Error) {
          if (error.message.includes('Unauthorized')) {
            return new Response('Authentication failed', { status: 401 });
          }
          if (error.message.includes('vault')) {
            return new Response('Vault not found or access denied', { status: 404 });
          }
        }
        
        return new Response('Internal server error', { status: 500 });
    }
}