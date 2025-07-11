import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { IRateLimitService, IConfigService, IRedisService } from '../services/repository/interfaces';
import { container } from '../services/config/inversify.config';
import { TYPES } from '../services/config/types';

// Redis-based rate limiting service
class RedisRateLimitService implements IRateLimitService {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private redisService: IRedisService;

  constructor(redisService: IRedisService, configService: IConfigService) {
    this.redisService = redisService;
    const rateLimitConfig = configService.getRateLimitConfig();
    this.maxRequests = rateLimitConfig.max;
    this.windowMs = rateLimitConfig.window;
  }

  async checkLimit(ip: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const key = `rate_limit:${ip}:${endpoint}`;
    const now = Date.now();
    const resetTime = new Date(now + this.windowMs);

    try {
      const client = await this.redisService.getClient();
      if (!client) {
        // Fallback to allow request if Redis is not available
        return { 
          allowed: true, 
          remaining: this.maxRequests - 1, 
          resetTime 
        };
      }

      // Use Redis pipeline for atomic operations
      const pipeline = client.pipeline();
      
      // Get current count and TTL
      pipeline.get(key);
      pipeline.ttl(key);
      
      const results = await pipeline.exec();
      const currentCount = results?.[0]?.[1] ? parseInt(results[0][1] as string) : 0;
      const ttl = results?.[1]?.[1] ? parseInt(results[1][1] as string) : -1;

      // If key doesn't exist or has expired, reset
      if (currentCount === 0 || ttl === -1) {
        await client.setex(key, Math.ceil(this.windowMs / 1000), '1');
        return { 
          allowed: true, 
          remaining: this.maxRequests - 1, 
          resetTime 
        };
      }

      // Check if limit exceeded
      if (currentCount >= this.maxRequests) {
        const actualResetTime = new Date(now + (ttl * 1000));
        return { 
          allowed: false, 
          remaining: 0, 
          resetTime: actualResetTime 
        };
      }

      // Increment counter
      const newCount = await client.incr(key);
      const actualResetTime = new Date(now + (ttl * 1000));

      return { 
        allowed: true, 
        remaining: this.maxRequests - newCount, 
        resetTime: actualResetTime 
      };

    } catch (error) {
      console.error('Redis rate limit check error:', error);
      // Fallback to allow request if Redis fails
      return { 
        allowed: true, 
        remaining: this.maxRequests - 1, 
        resetTime 
      };
    }
  }

  async recordRequest(ip: string, endpoint: string): Promise<void> {
    // This is handled in checkLimit for Redis implementation
    // No additional action needed as we increment in checkLimit
  }

  async clearLimits(ip?: string): Promise<void> {
    try {
      const client = await this.redisService.getClient();
      if (!client) {
        return;
      }

      if (ip) {
        // Clear all keys for specific IP
        const pattern = `rate_limit:${ip}:*`;
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } else {
        // Clear all rate limit keys
        const pattern = 'rate_limit:*';
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(...keys);
        }
      }
    } catch (error) {
      console.error('Redis clear limits error:', error);
    }
  }
}

// Rate limiting plugin
export default fp(async (fastify: FastifyInstance) => {
  // Get services from the container
  const configService = container.get(TYPES.ConfigService) as IConfigService;
  const redisService = container.get(TYPES.RedisService) as IRedisService;
  
  const rateLimitService = new RedisRateLimitService(redisService, configService);

  // Add rate limiting hook
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip;
    const endpoint = request.url;

    // Skip rate limiting for health checks
    if (endpoint === '/health' || endpoint === '/' || endpoint.startsWith('/health/')) {
      return;
    }

    const { allowed, remaining, resetTime } = await rateLimitService.checkLimit(ip, endpoint);

    // Add rate limit headers
    const rateLimitConfig = configService.getRateLimitConfig();
    reply.header('X-RateLimit-Limit', rateLimitConfig.max);
    reply.header('X-RateLimit-Remaining', remaining);
    reply.header('X-RateLimit-Reset', resetTime.getTime());

    if (!allowed) {
      // Log security event
      fastify.log.warn(`Rate limit exceeded for IP: ${ip}, endpoint: ${endpoint}`);
      
      reply.status(429);
      return reply.send({
        success: false,
        message: 'Too many requests. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000)
      });
    }

    // Record the request (handled automatically in checkLimit for Redis)
    await rateLimitService.recordRequest(ip, endpoint);
  });

  // Decorate fastify with rate limit service
  fastify.decorate('rateLimitService', rateLimitService);
}, {
  name: 'rate-limit',
  dependencies: ['redis']
});

// TypeScript declarations
declare module 'fastify' {
  export interface FastifyInstance {
    rateLimitService: IRateLimitService;
  }
}
