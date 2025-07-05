import { injectable } from "inversify";
import {
  ChatMessage,
  IRedisContext,
} from "../repository/IRedisContextRepository";
import Redis from 'ioredis'

@injectable()
export class RedisContextService implements IRedisContext {
  private client: Redis;
  private TTL = 60 * 30; // seconds (30 min)

    constructor() {
    // Support both URL format and individual config options
    const redisUrl = process.env.REDIS_URL;
    
    this.client = redisUrl 
      ? new Redis(redisUrl, {
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          reconnectOnError: (err) => {
            const targetError = "READONLY";
            return err.message.includes(targetError);
          },
        })
      : new Redis({
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379"),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || "0"),
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          reconnectOnError: (err) => {
            const targetError = "READONLY";
            return err.message.includes(targetError);
          },
        });

    // Handle connection events
    this.client.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    this.client.on("connect", () => {
      console.log("Connected to Redis");
    });
  }

  private key(workspaceId: string) {
    return `ws:${workspaceId}:ctx`;
  }

  async get(workspaceId: string): Promise<ChatMessage[]> {
    const key = this.key(workspaceId);
    const data = await this.client.get(key);
    if (!data) return [];
    await this.client.expire(key, this.TTL);
    try {
      return JSON.parse(data) as ChatMessage[];
    } catch (e) {
      console.error("Failed to JSON.parse Redis data for key", key, e);
      return [];
    }
  }

  async push(workspaceId: string, message: ChatMessage): Promise<void> {
    const key = this.key(workspaceId);
    const msgs = await this.get(workspaceId);
    msgs.push(message);
    if (msgs.length > 50) msgs.shift(); // keep last 50
    const serialized = JSON.stringify(msgs);
    await this.client.setex(key, this.TTL, serialized);
  }

  async reset(workspaceId: string): Promise<void> {
    await this.client.del(this.key(workspaceId));
  }

  /**
   * Gracefully disconnect from Redis
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error("Redis disconnect error:", error);
    }
  }
}
