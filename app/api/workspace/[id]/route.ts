//api/workspace/[id]/route.ts

import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { container } from '@/src/config/inversify.config';
import { TYPES } from '@/src/config/types';
import { WorkspaceMessagesController } from '@/src/controllers/WorkspaceMesssagesController';
import { RedisContextController } from '@/src/controllers/RedisContextController';
import { chartTool } from '@/lib/tools/chartGenerator';
import { economicIndicatorTool } from '@/lib/tools/economicIndicator';
import { economicNewsTool } from '@/lib/tools/economicNews';
import { auth } from '@clerk/nextjs/server';
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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get authenticated user
    const { getToken } = await auth();
    const token = await getToken();
    
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Await params to get workspace ID
    const { id: workspaceId } = await params;
      if (!workspaceId) {
      return new Response('Workspace ID is required', { status: 400 });
    }    // Parse request body with validation
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
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
    const SYSTEM_PROMPT = systemPrompts[selectedSystem];

    console.log(`Using ${selectedSystem} economic perspective for workspace ${workspaceId}`);//TODO:Remove the console.log in production

    // Get controllers from DI container
    const workspaceMessagesController = container.get<WorkspaceMessagesController>(TYPES.WorkspaceMessagesController);
    const redisContextController = container.get<RedisContextController>(TYPES.RedisContextController);

    // Find last user message
    const userMessages = messages.filter((m: Message) => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    if (!lastUserMessage) {
      return new Response('No user message found', { status: 400 });
    }

    // Validate Google API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('Google API key is not configured');
      return new Response('Service configuration error', { status: 500 });
    }

    // Create Google AI model
    const model = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
    })('gemini-2.0-flash', { useSearchGrounding: true });

    // Persist user message to database
    const userMessageId = uuidv4();
    await workspaceMessagesController.insertMessageToWorkspace({
      id: userMessageId,
      workspace_id: workspaceId,
      role: 'user',
      content: lastUserMessage.content,
      created_at: new Date().toISOString()
    }, token);

    // Update Redis context
    await redisContextController.pushMessage(workspaceId, {
      role: 'user',
      content: lastUserMessage.content,
      timestamp: new Date().toISOString()
    });

    // Generate AI response
    const { textStream } = streamText({
      model,
      messages: messages,
      system: SYSTEM_PROMPT,
      tools: {
        chartTool,
        economicIndicatorTool,
        economicNewsTool
      },
      temperature: temperature || 0.7,
      maxTokens: 2000,
      onFinish: async (result) => {
        try {
          // Persist assistant message to database
          const assistantMessageId = uuidv4();
          await workspaceMessagesController.insertMessageToWorkspace({
            id: assistantMessageId,
            workspace_id: workspaceId,
            role: 'assistant',
            content: result.text,
            created_at: new Date().toISOString()
          }, token);

          // Update Redis context with assistant response
          await redisContextController.pushMessage(workspaceId, {
            role: 'assistant',
            content: result.text,
            timestamp: new Date().toISOString()
          });

          console.log(`Messages persisted for workspace ${workspaceId}`);
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
    console.error('Error in workspace chat handler:', error);
    
    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return new Response('Authentication failed', { status: 401 });
      }
      if (error.message.includes('workspace')) {
        return new Response('Workspace not found or access denied', { status: 404 });
      }
    }
    
    return new Response('Internal server error', { status: 500 });
  }
}