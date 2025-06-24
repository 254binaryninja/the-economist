import { injectable } from "inversify";
import {
  ChatMessage,
  IRedisContext,
} from "../repository/IRedisContextRepository";
import { createClient, RedisClientType } from "redis";

@injectable()
export class RedisContextService implements IRedisContext {
  private client: RedisClientType;
  private TTL = 60 * 30; // seconds (30 min)

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    this.client.connect();
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
    await this.client.setEx(key, this.TTL, serialized);
  }

  async reset(workspaceId: string): Promise<void> {
    await this.client.del(this.key(workspaceId));
  }
}
