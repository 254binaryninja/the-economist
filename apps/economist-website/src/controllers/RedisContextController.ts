import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import type {
  IRedisContext,
  ChatMessage,
} from "../domain/repository/IRedisContextRepository";

@injectable()
export class RedisContextController {
  constructor(
    @inject(TYPES.IRedisContextRepository)
    private redisContextRepository: IRedisContext,
  ) {}

  async getContext(workspaceId: string) {
    return this.redisContextRepository.get(workspaceId);
  }

  async pushMessage(workspaceId: string, message: ChatMessage) {
    return this.redisContextRepository.push(workspaceId, message);
  }

  async resetContext(workspaceId: string) {
    return this.redisContextRepository.reset(workspaceId);
  }
}
