import { IRedisService } from '../plugins/redisManager';

declare module 'fastify' {
  interface FastifyInstance {
    redis: IRedisService;
  }
}

