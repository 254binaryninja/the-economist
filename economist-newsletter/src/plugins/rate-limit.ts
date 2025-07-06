import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { IRateLimitService } from '../services/interfaces/services.interfaces';
import Redis from 'ioredis';
import { container,TYPES } from '../services/config/inversify.config';
import { IConfigService } from '../services/interfaces/services.interfaces';


// Redis-based rate limiting service
class RedisRateLimitService implements IRateLimitService {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private client: Redis;

  constructor() {
    // Get config service instance from the container
    const config = container.get<IConfigService>(TYPES.ConfigService);
    const rateLimitConfig = config.getRateLimitConfig();
    this.maxRequests = rateLimitConfig.max;
    this.windowMs = rateLimitConfig.window;

    //Initialize Redis client
    const redisUrl = config.getRedisUrl();

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
          host: config.getRedisHost(),
          port: config.getRedisPort(),
          password: config.getRedisPassword(),
          db: config.getRedisDb(),
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

  async checkLimit(ip: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const key = `rate_limit:${ip}:${endpoint}`;
    const now = Date.now();
    const resetTime = new Date(now + this.windowMs);

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.client.pipeline();
      
      // Get current count and TTL
      pipeline.get(key);
      pipeline.ttl(key);
      
      const results = await pipeline.exec();
      const currentCount = results?.[0]?.[1] ? parseInt(results[0][1] as string) : 0;
      const ttl = results?.[1]?.[1] ? parseInt(results[1][1] as string) : -1;

      // If key doesn't exist or has expired, reset
      if (currentCount === 0 || ttl === -1) {
        await this.client.setex(key, Math.ceil(this.windowMs / 1000), '1');
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
      const newCount = await this.client.incr(key);
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
      if (ip) {
        // Clear all keys for specific IP
        const pattern = `rate_limit:${ip}:*`;
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } else {
        // Clear all rate limit keys
        const pattern = 'rate_limit:*';
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      }
    } catch (error) {
      console.error('Redis clear limits error:', error);
    }
  }

  // Cleanup method for graceful shutdown
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }
}

// Rate limiting plugin
export default fp(async (fastify: FastifyInstance) => {
  const rateLimitService = new RedisRateLimitService();

  // Add rate limiting hook
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip;
    const endpoint = request.url;

    // Skip rate limiting for health checks
    if (endpoint === '/health' || endpoint === '/') {
      return;
    }
    // Get the config service from the container
    const config = container.get<IConfigService>(TYPES.ConfigService);

    const { allowed, remaining, resetTime } = await rateLimitService.checkLimit(ip, endpoint);

    // Add rate limit headers
    reply.header('X-RateLimit-Limit', config.getRateLimitConfig().max);
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

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    if (rateLimitService instanceof RedisRateLimitService) {
      await rateLimitService.disconnect();
    }
  });

  // Decorate fastify with rate limit service
  fastify.decorate('rateLimitService', rateLimitService);
});

// TypeScript declarations
declare module 'fastify' {
  export interface FastifyInstance {
    rateLimitService: IRateLimitService;
  }
}
