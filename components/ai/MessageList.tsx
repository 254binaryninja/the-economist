'use client';

import { forwardRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ExtendedMessage } from '@/types';

interface MessageListProps {
  messages: ExtendedMessage[];
  scrollRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  onToggleUpvote?: (id: string, voteType: 'upvote' | 'downvote') => Promise<void>;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, scrollRef, isLoading, onToggleUpvote }, ref) => {
    // Filter out system messages for display
    const displayMessages = messages.filter(m => m.role !== 'system');
    
    const hasMessages = displayMessages.length > 0;

    return (
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="min-h-full flex flex-col">
            {!hasMessages ? (
              // Empty state - centered
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-3 max-w-md">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Start a conversation
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Type a message below to begin chatting with our AI economist. 
                    Ask questions, request analysis, or upload files for review.
                  </p>
                </div>
              </div>
            ) : (
              // Messages list - full width with proper spacing
              <div className="flex-1 space-y-4 p-4 sm:p-6">
                {displayMessages.map((message, index) => (
                  <MessageBubble
                    key={message.id || `${message.role}-${index}`}
                    message={message}
                    isLast={index === displayMessages.length - 1}
                    onToggleUpvote={onToggleUpvote}
                  />
                ))}
                
                {/* Loading indicator at the end of messages */}
                {isLoading && (
                  <div className="flex justify-start">
                    <LoadingIndicator />
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';