'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useChat, type Message } from '@ai-sdk/react';
import { toast } from 'sonner';
import { useWorkspaceMessages } from '@/hooks/workspace/useWorkspaceMessages';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { useUserStore } from '@/store/UserStore';
import { filesToAttachments } from '@/lib/file-utils';
import type { ExtendedMessage } from '@/types';
import { Skeleton } from '../ui/skeleton';

function useScrollToBottom(dep: any) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);
  return ref;
}

export default function WorkspaceChat({
  workspaceId,
  initialSystemMode = 'normal',
}: {
  workspaceId: string;
  initialSystemMode?: string;
}) {
  const { verbosity } = useUserStore();
  const [systemMode, setSystemMode] = useState(initialSystemMode);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const { messages: history, fetchMessages, toggleUpvoting } = useWorkspaceMessages(workspaceId);
  
  const { 
    messages, 
    setMessages, 
    input, 
    setInput, 
    handleSubmit, 
    isLoading, 
    append 
  } = useChat({
    api: `/api/workspace/${workspaceId}`,
    initialMessages: [],
    body: {
      system: systemMode,
      temperature: parseFloat(verbosity?.toString() || '0.7'),
    },
    onError: (err: Error) => {
      console.error('Chat error:', err);
      toast.error(err.message);
    },
    onToolCall: async ({ toolCall }: { toolCall: any }) => {
      console.log('Tool called:', toolCall.toolName, 'with args:', toolCall.args);
    
      if (toolCall.toolName === 'chartTool') {
        const args = toolCall.args as any;
        
        // Ensure the chart data has the correct structure
        const chartData = {
          data: args.data,
          xKey: args.xKey,
          yKey: args.yKey,
          type: args.chartType || args.type || 'bar'
        };
        
        console.log('Chart data prepared:', chartData);
        
        const result = {
          toolName: 'chartTool',
          result: chartData,
          success: true
        };
        
        toast.success('Chart generated successfully');
        return { 
          name: toolCall.toolName, 
          content: JSON.stringify(result)
        };
      }
      
      // Handle other tools generically
      const result = {
        toolName: toolCall.toolName,
        result: toolCall.args,
        success: true
      };
      
      return { 
        name: toolCall.toolName, 
        content: JSON.stringify(result) 
      };
    },
  });

  const scrollRef = useScrollToBottom(messages);

  // Load history once on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        await fetchMessages();
      } catch (error) {
        console.error('Failed to load message history:', error);
        toast.error('Failed to load previous messages');
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };
    
    if (!isHistoryLoaded) {
      loadHistory();
    }
    
    return () => {
      isMounted = false;
    };
  }, [workspaceId, isHistoryLoaded]); // Removed fetchMessages and historyLoadComplete

  // Process history into messages when history changes
  useEffect(() => {
    if (isLoadingHistory) return;
    
    if (history.length > 0 && !isHistoryLoaded) {
      // Convert history to Message format with grounding info
      const pastMessages: ExtendedMessage[] = history.map((m) => {
        const baseMessage: ExtendedMessage = {
          id: m.id,
          role: m.role as Message['role'],
          content: m.content,
          isUpvoted: m.is_upvoted,
        };

        // Parse grounding data from metadata if available
        if (m.metadata && typeof m.metadata === 'string') {
          try {
            const metadata = JSON.parse(m.metadata);
            if (metadata.grounding) {
              baseMessage.grounding = metadata.grounding;
            }
          } catch (error) {
            console.warn('Failed to parse message metadata:', error);
          }
        } else if (m.metadata && typeof m.metadata === 'object') {
          // Handle case where metadata is already parsed
          const metadata = m.metadata as any;
          if (metadata.grounding) {
            baseMessage.grounding = metadata.grounding;
          }
        }

        return baseMessage;
      });

      // Sort messages by timestamp or order to ensure proper sequence
      pastMessages.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });

      setMessages(pastMessages);
      setIsHistoryLoaded(true);
    } else if (history.length === 0 && !isHistoryLoaded && !isLoadingHistory) {
      // Handle empty workspace
      setMessages([]);
      setIsHistoryLoaded(true);
    }
  }, [history, isLoadingHistory, isHistoryLoaded, setMessages]);

  const handleChatSubmit = useCallback(async (e: React.FormEvent, options?: {
    files?: FileList;
    systemMode?: string;
  }) => {
    e.preventDefault();
    
    if (!input.trim() && !options?.files?.length) return;
    
    try {
      // Convert files to attachments
      const attachments = options?.files ? await filesToAttachments(options.files) : [];
      
      // Update body with current system mode and temperature
      const requestBody = {
        system: options?.systemMode || systemMode,
        temperature: parseFloat(verbosity?.toString() || '0.7'),
      };
      
      // Clear input immediately to prevent double submission
      const messageContent = input;
      setInput('');
      
      // Use append to add the message with attachments
      await append(
        {
          role: 'user',
          content: messageContent,
          experimental_attachments: attachments.length > 0
            ? attachments.filter((att): att is { name: string; contentType: string; url: string } => !!(att as any).url)
            : undefined,
        },
        { body: requestBody }
      );
      
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to send message. Please try again.');
      // Restore input on error
      setInput(input);
    }
  }, [input, setInput, append, systemMode, verbosity]);

  // Show loading state
  if (isLoadingHistory) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <p className="text-sm text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
        <div className="p-4 border-t">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <MessageList 
        messages={messages as ExtendedMessage[]}
        scrollRef={scrollRef as React.RefObject<HTMLDivElement>}
        isLoading={isLoading}
        onToggleUpvote={(id: string, voteType: 'upvote' | 'downvote') => toggleUpvoting(id, voteType)}
      />
      
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleChatSubmit}
        isLoading={isLoading}
        systemMode={systemMode}
        onSystemModeChange={setSystemMode}
        showSystemModeSelector={true}
        acceptedFileTypes="image/*,application/pdf,.txt,.doc,.docx,.csv,.xlsx"
      />
      
      <div className="flex justify-center items-center mt-3 p-3">
        <p className='text-sm text-muted-foreground'>
          AI can make mistakes. Please verify the information before making any decisions.
        </p>
      </div>
    </div>
  );
}