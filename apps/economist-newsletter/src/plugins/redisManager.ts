import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { injectable, inject } from 'inversify';
import type { IConfigService } from '../services/repository/interfaces';
import { TYPES } from '../services/config/types';

// Conditional import for Redis to avoid client-side bundling issues
let Redis: any;

async function getRedis() {
  // Only import Redis on server-side (Node.js environment)
  if (!Redis) {
    try {
      const redisModule = await import('ioredis');
      Redis = redisModule.default;
    } catch (error) {
      console.warn('Redis module could not be loaded:', error);
    }
  }
  return Redis;
}

export interface IRedisService {
  getClient(): Promise<InstanceType<typeof import('ioredis').default> | null>;
  isConnected(): boolean;
  getStats(): { isConnected: boolean; connectionCount: number; isInitialized: boolean };
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
}

@injectable()
class RedisServiceImpl implements IRedisService {
  private redis: InstanceType<typeof import('ioredis').default> | null = null;
  private initializationPromise: Promise<void> | null = null;
  private isInitialized = false;
  private connectionCount = 0;

  constructor(
    @inject(TYPES.ConfigService) private configService: IConfigService
  ) {}

  /**
   * Get a Redis client instance. Initializes connection if needed.
   */
  async getClient(): Promise<InstanceType<typeof import('ioredis').default> | null> {
    // Increment connection count for tracking
    this.connectionCount++;

    if (this.initializationPromise) {
      // Wait for ongoing initialization to complete
      await this.initializationPromise;
    } else if (!this.isInitialized) {
      // Start initialization if not already started
      this.initializationPromise = this.initializeRedis();
      await this.initializationPromise;
    }

    return this.redis;
  }

  private async initializeRedis(): Promise<void> {
    if (this.isInitialized) {
      // Don't initialize Redis if already initialized
      return;
    }

    try {
      const RedisClass = await getRedis();
      if (!RedisClass) {
        console.error('Redis could not be loaded');
        return;
      }

      console.log('Initializing Redis connection...');

      // Initialize Redis client with robust configuration using config service
      const redisUrl = this.configService.getRedisUrl();
      
      this.redis = redisUrl 
        ? new RedisClass(redisUrl, {
            enableReadyCheck: false,
            maxRetriesPerRequest: 3,
            lazyConnect: false, // Connect immediately to catch connection errors early
            reconnectOnError: (err: any) => {
              const targetError = "READONLY";
              return err.message.includes(targetError);
            },
          })
        : new RedisClass({
            host: this.configService.getRedisHost(),
            port: this.configService.getRedisPort(),
            password: this.configService.getRedisPassword(),
            db: this.configService.getRedisDb(),
            enableReadyCheck: false,
            maxRetriesPerRequest: 3,
            lazyConnect: false, // Connect immediately to catch connection errors early
            reconnectOnError: (err: any) => {
              const targetError = "READONLY";
              return err.message.includes(targetError);
            },
          });

      // Set up event handlers
      if (this.redis) {
        this.redis.on("error", (err: any) => {
          console.error("Redis connection error:", err);
        });

        this.redis.on("connect", () => {
          console.log("Redis connected successfully");
        });

        this.redis.on("ready", () => {
          console.log("Redis ready");
        });

        this.redis.on("reconnecting", () => {
          console.log("Redis reconnecting");
        });

        this.redis.on("close", () => {
          console.log("Redis connection closed");
        });

        // Wait for connection to be established
        await this.redis.ping();
        this.isInitialized = true;
        console.log("Redis initialization completed successfully");
      }
      
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      // Set redis to null to ensure no operations are attempted
      this.redis = null;
    } finally {
      // Clear the initialization promise
      this.initializationPromise = null;
    }
  }

  /**
   * Check if Redis is available and connected
   */
  isConnected(): boolean {
    return this.redis !== null && this.isInitialized;
  }

  /**
   * Get connection statistics
   */
  getStats(): { isConnected: boolean; connectionCount: number; isInitialized: boolean } {
    return {
      isConnected: this.isConnected(),
      connectionCount: this.connectionCount,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Gracefully disconnect from Redis
   * Should only be called during application shutdown
   */
  async disconnect(): Promise<void> {
    try {
      if (this.redis && this.isInitialized) {
        console.log('Disconnecting from Redis...');
        await this.redis.quit();
        this.redis = null;
        this.isInitialized = false;
        this.connectionCount = 0;
        console.log('Redis disconnected successfully');
      }
    } catch (error) {
      console.error("Redis disconnect error:", error);
    }
  }

  /**
   * Force reconnection (useful for error recovery)
   */
  async reconnect(): Promise<void> {
    console.log('Force reconnecting Redis...');
    await this.disconnect();
    this.initializationPromise = this.initializeRedis();
    await this.initializationPromise;
  }
}

// Fastify plugin for Redis integration
async function redisPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Get the Redis service from the container
  const { container } = await import('../services/config/inversify.config.js');
  const redisService = container.get(TYPES.RedisService) as IRedisService;

  // Initialize Redis connection
  await redisService.getClient();

  // Decorate Fastify instance with Redis service
  fastify.decorate('redis', redisService);

  // Add graceful shutdown
  fastify.addHook('onClose', async () => {
    await redisService.disconnect();
  });

  // Health check endpoint for Redis
  fastify.get('/health/redis', async () => {
    const stats = redisService.getStats();
    return {
      redis: {
        connected: stats.isConnected,
        initialized: stats.isInitialized,
        connectionCount: stats.connectionCount,
        timestamp: new Date().toISOString()
      }
    };
  });
}

// Export the plugin
export default fp(redisPlugin, {
  name: 'redis',
  dependencies: []
});

// Export the service class for dependency injection
export const RedisService = RedisServiceImpl;
