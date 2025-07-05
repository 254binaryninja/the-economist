import { injectable } from "inversify";
import { IWorkspaceMessagesRepository } from "../repository/IWorkspaceMessagesRepository";
import {
  WorkspaceMessage,
  WorkspaceMessageInsert,
  WorkspaceMessageUpdate,
} from "../repository/IWorkspaceMessagesRepository";
import { supabaseManager } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";


// Conditional import for Redis to avoid client-side bundling issues
let Redis: typeof import('ioredis').default | undefined;

async function getRedis() {
  if (typeof window === 'undefined' && !Redis) {
    // Only import Redis on server-side
    const redisModule = await import('ioredis');
    Redis = redisModule.default;
  }
  return Redis;
}


@injectable()
export class WorkspaceMessagesService implements IWorkspaceMessagesRepository {
   private token: string | null = null;
   private redis: InstanceType<typeof import('ioredis').default> | null = null;
   private readonly CACHE_TTL = 60 * 60; // 1 hour
   private readonly CACHE_PREFIX = 'space_messages';
   private redisInitialized = false;

  private getSupabaseClient(): SupabaseClient {
    return supabaseManager.getClient(this.token || undefined);
  }

  constructor () {
    //Initialize redis client
    this.initializeRedis()
  }

  private async ensureRedisInitialized(): Promise<void> {
        if (!this.redisInitialized && typeof window === 'undefined') {
            await this.initializeRedis();
        }
     }

  private async initializeRedis() {
    if (typeof window !== 'undefined' || this.redisInitialized) {
          // Don't initialize Redis on client-side or if already initialized
          return;
        }

        try {
            const RedisClass = await getRedis();
            if (!RedisClass) {
              console.error('Redis could not be loaded');
              return;
            }

            // Initialize Redis client
            const redisUrl = process.env.REDIS_URL;
            
            this.redis = redisUrl 
              ? new RedisClass(redisUrl, {
                  enableReadyCheck: false,
                  maxRetriesPerRequest: 3,
                  lazyConnect: true,
                })
              : new RedisClass({
                  host: process.env.REDIS_HOST || "localhost",
                  port: parseInt(process.env.REDIS_PORT || "6379"),
                  password: process.env.REDIS_PASSWORD,
                  db: parseInt(process.env.REDIS_DB || "0"),
                  enableReadyCheck: false,
                  maxRetriesPerRequest: 3,
                  lazyConnect: true,
                });

            this.redis.on("error", (err) => {
              console.error("Redis connection error in SpaceMessagesService:", err);
            });

            this.redisInitialized = true;
        } catch (error) {
            console.error('Failed to initialize Redis:', error);
        }
  }

  private getCacheKey(spaceId: string): string {
        return `${this.CACHE_PREFIX}:${spaceId}`;
     }

     private getMessageCacheKey(messageId: string): string {
        return `${this.CACHE_PREFIX}:message:${messageId}`;
     }

     private async getCachedMessages(workspaceId: string): Promise<WorkspaceMessage[] | null> {
        try {
            await this.ensureRedisInitialized();
            if (!this.redis) return null;
            const cached = await this.redis.get(this.getCacheKey(workspaceId));
            return cached ? JSON.parse(cached) as WorkspaceMessage[] : null;
        } catch (error) {
            console.error("Error getting cached messages:", error);
            return null;
        }
     }

     private async setCachedMessages(spaceId: string, messages: WorkspaceMessage[]): Promise<void> {
        try {
            await this.ensureRedisInitialized();
            if (!this.redis) return;
            await this.redis.setex(
                this.getCacheKey(spaceId), 
                this.CACHE_TTL, 
                JSON.stringify(messages)
            );
        } catch (error) {
            console.error("Error setting cached messages:", error);
        }
     }

     private async invalidateWorkspaceCache(workspaceId: string): Promise<void> {
        try {
            await this.ensureRedisInitialized();
            if (!this.redis) return;
            await this.redis.del(this.getCacheKey(workspaceId));
        } catch (error) {
            console.error("Error invalidating workspace cache:", error);
        }
     }

     /**
      * Smart cache update: tries to update cache with new message,
      * falls back to invalidation if cache doesn't exist or operation fails
      */
     private async updateCacheWithNewMessage(spaceId: string, newMessage: WorkspaceMessage): Promise<void> {
        try {
            const cachedMessages = await this.getCachedMessages(spaceId);
            
            if (cachedMessages) {
                // Cache exists, append new message and maintain order
                const updatedMessages = [...cachedMessages, newMessage].sort((a, b) => 
                    new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
                );
                
                // Limit cache size (keep last 100 messages to prevent memory bloat)
                const limitedMessages = updatedMessages.slice(-100);
                
                await this.setCachedMessages(spaceId, limitedMessages);
                console.log(`Cache updated with new message for space: ${spaceId}`);
            } else {
                // Cache doesn't exist, don't create it (let next read handle it)
                console.log(`No cache to update for space: ${spaceId}, will be populated on next read`);
            }
        } catch (error) {
            console.error("Error updating cache with new message, invalidating instead:", error);
            // Fallback to invalidation if update fails
            await this.invalidateWorkspaceCache(spaceId);
        }
     }

     /**
      * Smart cache update for modified messages: finds and updates the specific message
      */
     private async updateCacheWithModifiedMessage(spaceId: string, updatedMessage: WorkspaceMessage): Promise<void> {
        try {
            const cachedMessages = await this.getCachedMessages(spaceId);
            
            if (cachedMessages) {
                // Find and update the specific message
                const messageIndex = cachedMessages.findIndex(msg => msg.id === updatedMessage.id);
                
                if (messageIndex !== -1) {
                    // Update the message in place
                    cachedMessages[messageIndex] = updatedMessage;
                    await this.setCachedMessages(spaceId, cachedMessages);
                    console.log(`Cache updated with modified message for space: ${spaceId}`);
                } else {
                    // Message not found in cache, invalidate to be safe
                    console.log(`Modified message not found in cache for space: ${spaceId}, invalidating`);
                    await this.invalidateWorkspaceCache(spaceId);
                }
            } else {
                // Cache doesn't exist, nothing to update
                console.log(`No cache to update for space: ${spaceId}, will be populated on next read`);
            }
        } catch (error) {
            console.error("Error updating cache with modified message, invalidating instead:", error);
            // Fallback to invalidation if update fails
            await this.invalidateWorkspaceCache(spaceId);
        }
     }

  async setToken(token: string): Promise<void> {
    this.token = token;
  }

  async getMessagesByWorkspaceId(
    workspaceId: string,
  ): Promise<WorkspaceMessage[]> {
    // First, try to get messages from cache
    const cachedMessages = await this.getCachedMessages(workspaceId);
    if (cachedMessages) {
      console.log(`Cache hit for workspace: ${workspaceId}`);
      return cachedMessages;
    }
    console.log(`Cache miss for workspace: ${workspaceId}, fetching from database`);
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("workspace_messages")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching messages by workspace ID:", error);
      return [];
    }

    return (data as WorkspaceMessage[]) || [];
  }

  async insertMessageToWorkspace(
    workspaceMessage: WorkspaceMessageInsert,
  ): Promise<WorkspaceMessage> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("workspace_messages")
      .insert(workspaceMessage)
      .single();

    if (error) {
      console.error("Error inserting message to workspace:", error);
      throw new Error("Failed to insert message");
    }

    // Update cache with the new message
    await this.updateCacheWithNewMessage(workspaceMessage.workspace_id, data as WorkspaceMessage);

    return data as WorkspaceMessage;
  }

  async updateMessageInWorkspace(
    id: string,
    workspaceMessage: WorkspaceMessageUpdate,
  ): Promise<WorkspaceMessage | null> {
    const supabaseWithAuth = this.getSupabaseClient();
    const { data, error } = await supabaseWithAuth
      .from("workspace_messages")
      .update(workspaceMessage)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error updating message in workspace:", error);
      return null;
    }

    // Smart cache update for message modifications
    if( data ) {
      await this.updateCacheWithModifiedMessage(workspaceMessage.workspace_id!, data as WorkspaceMessage);
    }

    return data as WorkspaceMessage;
  }

  /**
     * Manually refresh cache for a specific workspace
     */
    async refreshWorkspaceCache(workspaceId: string): Promise<WorkspaceMessage[]> {
        console.log(`Manually refreshing cache for workspace: ${workspaceId}`);

        // Invalidate current cache
        await this.invalidateWorkspaceCache(workspaceId);

        // Fetch fresh data and cache it
        return await this.getMessagesByWorkspaceId(workspaceId);
    }

    /**
     * Get cache statistics for monitoring
     */
    async getCacheStats(spaceId: string): Promise<{ cached: boolean; ttl: number | null; size?: number }> {
        try {
            await this.ensureRedisInitialized();
            if (!this.redis) return { cached: false, ttl: null };
            
            const exists = await this.redis.exists(this.getCacheKey(spaceId));
            const ttl = exists ? await this.redis.ttl(this.getCacheKey(spaceId)) : null;
            
            let size: number | undefined;
            if (exists) {
                const cachedMessages = await this.getCachedMessages(spaceId);
                size = cachedMessages?.length || 0;
            }
            
            return {
                cached: !!exists,
                ttl: ttl,
                size: size
            };
        } catch (error) {
            console.error("Error getting cache stats:", error);
            return { cached: false, ttl: null };
        }
    }

    /**
     * Bulk invalidate multiple space caches (useful for cleanup operations)
     */
    async bulkInvalidateSpaces(spaceIds: string[]): Promise<void> {
        try {
            await this.ensureRedisInitialized();
            if (!this.redis) return;
            
            const keys = spaceIds.map(id => this.getCacheKey(id));
            if (keys.length > 0) {
                await this.redis.del(...keys);
                console.log(`Bulk invalidated ${keys.length} space caches`);
            }
        } catch (error) {
            console.error("Error bulk invalidating space caches:", error);
        }
    }

    /**
     * Gracefully disconnect from Redis
     */
    async disconnect(): Promise<void> {
        try {
            if (this.redis) {
                await this.redis.quit();
            }
        } catch (error) {
            console.error("Redis disconnect error in SpaceMessagesService:", error);
        }
    }
}
