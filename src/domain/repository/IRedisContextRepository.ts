
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  grounding?: {
    groundingChunks: {
      web?: {
        uri: string;
        title: string;
      }
    }[];
    searchQueries?: string[];
  };
}

export interface IRedisContext {
  /**
   * Get the cached context for a workspace or vault.
   * Returns an array of ChatMessage or an empty array if none.
   *  @param workspaceId - The ID of the workspace or vault.
   *  @returns Promise resolving to an array of ChatMessage.
   */
  get(workspaceId: string): Promise<ChatMessage[]>;

  /**
   * Add a new message to the workspace or vault context in Redis.
   * Keeps only the most recent ~50 messages.
   *  @param workspaceId - The ID of the workspace or vault.
   *  @param message - The ChatMessage to add.
   */
  push(workspaceId: string, message: ChatMessage): Promise<void>;

  /**
   * Reset the workspace or vault context by deleting the Redis key.
   *  This will clear all cached messages.
   *  @param workspaceId - The ID of the workspace or vault.
   */
  reset(workspaceId: string): Promise<void>;
}