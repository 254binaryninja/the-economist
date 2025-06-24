export interface BugReport {
    type:'bug'
    userName: string;
    briefDescription: string;
    completeDescription: string;
}

// AI SDK types
import type { Message } from 'ai';

export type ChatMessage = Message;

export interface ChatAttachment {
  name?: string;
  contentType?: string;
  url: string;
}

// Grounding types for search citations
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface GroundingInfo {
  groundingChunks: GroundingChunk[];
  searchQueries: string[];
}

import type { ToolInvocation as ExternalToolInvocation } from '@ai-sdk/ui-utils';

export interface ExtendedMessage extends Message {
  experimental_attachments?: ChatAttachment[];
  toolInvocations?: ExternalToolInvocation[];
  grounding?: GroundingInfo;
  isUpvoted?:boolean | null;
  metadata?: any; // Add metadata field for storing tool results and other data
}