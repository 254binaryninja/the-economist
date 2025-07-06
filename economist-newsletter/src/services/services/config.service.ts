import { injectable } from 'inversify';
import { envSchema, EnvConfig } from '../../schemas/validation.schemas';
import { IConfigService } from '../interfaces/services.interfaces';

@injectable()
export class ConfigService implements IConfigService {
  private config!: EnvConfig;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      // Parse and validate environment variables
      const rawConfig = {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        BREVO_API_KEY: process.env.BREVO_API_KEY,
        GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        REDIS_DB: process.env.REDIS_DB,
        RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
        RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
        DEFAULT_FROM_EMAIL: process.env.DEFAULT_FROM_EMAIL,
        DEFAULT_FROM_NAME: process.env.DEFAULT_FROM_NAME
      };

      this.config = envSchema.parse(rawConfig);
    } catch (error) {
      console.error('❌ Invalid environment configuration:', error);
      process.exit(1);
    }
  }

  public get<T>(key: string): T {
    const value = this.config[key as keyof EnvConfig];
    if (value === undefined) {
      throw new Error(`Configuration key '${key}' not found`);
    }
    return value as T;
  }

  public getAll(): Record<string, any> {
    // Return sanitized config (no secrets)
    return {
      NODE_ENV: this.config.NODE_ENV,
      PORT: this.config.PORT,
      RATE_LIMIT_MAX: this.config.RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW: this.config.RATE_LIMIT_WINDOW
    };
  }

  public async validate(): Promise<boolean> {
    try {
      envSchema.parse(process.env);
      return true;
    } catch {
      return false;
    }
  }

  public async reload(): Promise<void> {
    this.loadConfig();
  }

  // Utility methods for common configs
  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  public getPort(): number {
    return Number(this.config.PORT);
  }

  // Secure API key getters
  public getBrevoApiKey(): string {
    return this.config.BREVO_API_KEY;
  }

  public getGoogleGenerativeAIApiKey(): string {
    return this.config.GOOGLE_GENERATIVE_AI_API_KEY;
  }

  public getJwtSecret(): string {
    return this.config.JWT_SECRET;
  }

  public getDatabaseUrl(): string | undefined {
    return this.config.DATABASE_URL;
  }

  public getRateLimitConfig(): { max: number; window: number } {
    return {
      max: Number(this.config.RATE_LIMIT_MAX),
      window: Number(this.config.RATE_LIMIT_WINDOW)
    };
  }

  public getRedisUrl(): string {
    return this.config.REDIS_URL;
  }

  public getRedisPassword(): string | undefined {
    return this.config.REDIS_PASSWORD;
  }

  public getRedisHost(): string {
    return this.config.REDIS_HOST;
  }

  public getRedisDb(): number {
    return this.config.REDIS_DB;
  }

  public getRedisPort(): number {
    return Number(this.config.REDIS_PORT);
  }

  // Email configuration getters
  public getDefaultFromEmail(): string {
    return this.config.DEFAULT_FROM_EMAIL;
  }

  public getDefaultFromName(): string {
    return this.config.DEFAULT_FROM_NAME;
  }
}
