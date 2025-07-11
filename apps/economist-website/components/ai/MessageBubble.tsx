"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageContent } from "./MessageContent";
import { MessageAttachments } from "./MessageAttachments";
import { MessageToolOutput } from "./MessageToolOutput";
import SearchGrounding from "./SearchGrounding";
import {
  User,
  Bot,
  Clipboard,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtendedMessage } from "@/types";
import Image from "next/image";
import { useState } from "react";

interface MessageBubbleProps {
  message: ExtendedMessage;
  isLast: boolean;
  onToggleUpvote?: (
    id: string,
    voteType: "upvote" | "downvote",
  ) => Promise<void>;
}

export function MessageBubble({
  message,
  isLast,
  onToggleUpvote,
}: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  if (!isAssistant && !isUser) {
    return null; // Don't render system messages
  }
  const handleToggleUpvote = async () => {
    if (!onToggleUpvote || !message.id || isUpvoting) return;

    setIsUpvoting(true);
    try {
      await onToggleUpvote(message.id, "upvote");
    } catch (error) {
      console.error("Error toggling upvote:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleToggleDownvote = async () => {
    if (!onToggleUpvote || !message.id || isUpvoting) return;

    setIsUpvoting(true);
    try {
      await onToggleUpvote(message.id, "downvote");
    } catch (error) {
      console.error("Error toggling downvote:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div
      className={cn("flex gap-2 sm:gap-3 group", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 mt-1">
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            isAssistant && "",
            isUser && "bg-secondary text-secondary-foreground",
          )}
        >
          {isAssistant ? (
            <Image
              src="/images/logo.png"
              alt="Economist"
              width={24}
              height={24}
              className="sm:w-8 sm:h-8"
            />
          ) : (
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          "flex-1 space-y-2 min-w-0",
          isUser && "flex flex-col items-end",
        )}
      >
        {/* Role Badge */}
        {/* <Badge 
          variant={isAssistant ? "default" : "secondary"}
          className="text-xs w-fit"
        >
          {isAssistant ? "Economist" : "You"}
        </Badge> */}{" "}
        {/* Message Card */}
        {isAssistant ? (
          <div className="max-w-[95%] sm:max-w-[85%] p-3 sm:p-4 space-y-2 sm:space-y-3 relative">
            {/* Text Content */}
            <MessageContent content={message.content} /> {/* Attachments */}
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <MessageAttachments
                  attachments={message.experimental_attachments}
                />
              )}
            {/* Tool Outputs */}
            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <MessageToolOutput
                toolInvocations={message.toolInvocations}
                messageContent={message.content}
                messageMetadata={message.metadata}
              />
            )}
            {/* Chart detection for messages without tool invocations */}
            {(!message.toolInvocations ||
              message.toolInvocations.length === 0) && (
              <MessageToolOutput
                messageContent={message.content}
                messageMetadata={message.metadata}
              />
            )}
            {/* Search Grounding */}
            {message.grounding && (
              <SearchGrounding grounding={message.grounding} />
            )}
            {/* Action Buttons Container */}
            <div className="flex items-center justify-between mt-2 sm:mt-3">
              {/* Upvoting section */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                  onClick={handleToggleUpvote}
                  disabled={isUpvoting}
                  className={cn(
                    "p-1 sm:p-1.5 rounded-md transition-all hover:scale-105 disabled:opacity-50 touch-manipulation",
                    message.isUpvoted === true
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500",
                  )}
                  title={
                    message.isUpvoted === true
                      ? "Remove upvote"
                      : "Upvote this response"
                  }
                >
                  <ThumbsUp
                    className={cn(
                      "h-3 w-3 sm:h-4 sm:w-4 transition-colors",
                      isUpvoting && "animate-pulse",
                    )}
                  />
                </button>
                <button
                  onClick={handleToggleDownvote}
                  disabled={isUpvoting}
                  className={cn(
                    "p-1 sm:p-1.5 rounded-md transition-all hover:scale-105 disabled:opacity-50 touch-manipulation",
                    message.isUpvoted === false
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500",
                  )}
                  title={
                    message.isUpvoted === false
                      ? "Remove downvote"
                      : "Downvote this response"
                  }
                >
                  <ThumbsDown
                    className={cn(
                      "h-3 w-3 sm:h-4 sm:w-4 transition-colors",
                      isUpvoting && "animate-pulse",
                    )}
                  />
                </button>
              </div>

              {/* Clipboard Button */}
              <button
                onClick={handleCopy}
                className="p-1 sm:p-1.5 rounded-md opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? (
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                ) : (
                  <Clipboard className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <Card
            className={cn(
              "max-w-[95%] sm:max-w-[85%] transition-colors relative",
              isUser && "bg-primary/5 border-primary/20 ml-auto",
            )}
          >
            <CardContent className="p-2 sm:p-3 space-y-2 sm:space-y-3">
              {/* Text Content */}
              <MessageContent content={message.content} />
              {/* Search Grounding Chucks */}
              {/* Attachments */}
              {message.experimental_attachments &&
                message.experimental_attachments.length > 0 && (
                  <MessageAttachments
                    attachments={message.experimental_attachments}
                  />
                )}{" "}
              {/* Tool Outputs */}
              {message.toolInvocations &&
                message.toolInvocations.length > 0 && (
                  <MessageToolOutput
                    toolInvocations={message.toolInvocations}
                    messageContent={message.content}
                    messageMetadata={message.metadata}
                  />
                )}
              {/* Chart detection for messages without tool invocations */}
              {(!message.toolInvocations ||
                message.toolInvocations.length === 0) && (
                <MessageToolOutput
                  messageContent={message.content}
                  messageMetadata={message.metadata}
                />
              )}
              {/* <button
              onClick={handleCopy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title={copied ? 'Copied!' : 'Copy'}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4 text-gray-500" />}
            </button> */}
            </CardContent>
          </Card>
        )}
        {/* Timestamp (optional - add if you have timestamp data) */}
        {/* {message.createdAt && (
          <p className="text-xs text-muted-foreground px-1">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </p>
        )} */}
      </div>
    </div>
  );
}
