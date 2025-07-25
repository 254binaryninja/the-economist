import { z } from 'zod';

// Newsletter subscription validation
export const subscribeSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .toLowerCase()
    .trim(),
  firstName: z.string()
    .min(1, 'First name required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in first name')
    .trim()
    .optional(),
  lastName: z.string()
    .min(1, 'Last name required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in last name')
    .trim()
    .optional(),
  listIds: z.array(z.number().int().positive())
    .max(10, 'Too many list IDs')
    .optional(),
  preferences: z.object({
    frequency: z.enum(['weekly', 'bi-weekly', 'monthly']).default('weekly'),
    topics: z.array(z.enum(['markets', 'policy', 'global', 'tech', 'crypto']))
      .max(5, 'Too many topics selected')
      .optional()
  }).optional()
});

// Unsubscribe validation
export const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  token: z.string().uuid('Invalid unsubscribe token').optional()
});

//News article schema
export const newsArticleSchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title too long').trim(),
  content: z.string().min(10, 'Content too short').max(50000, 'Content too long'),
  summary: z.string().max(500, 'Summary too long').optional(),
  type: z.enum(['weekly_preview', 'weekly_review']),
  publishDate: z.string().datetime().transform((str) => new Date(str)),
  sources: z.array(z.object({
    title: z.string().max(200),
    url: z.string().url(),
    publishedAt: z.string().datetime().transform((str) => new Date(str)),
    source: z.string().max(100)
  })).max(50, 'Too many sources')
})

// Newsletter content validation
export const newsletterContentSchema = z.object({
  title: z.string()
    .min(1, 'Title required')
    .max(200, 'Title too long')
    .trim(),
  content: z.string()
    .min(10, 'Content too short')
    .max(50000, 'Content too long'),
  summary: z.string()
    .max(500, 'Summary too long')
    .optional(),
  type: z.enum(['weekly_preview', 'weekly_review']),
  publishDate: z.string().datetime().transform((str) => new Date(str)),
  sources: z.array(z.object({
    title: z.string().max(200),
    url: z.string().url(),
    publishedAt: z.string().datetime().transform((str) => new Date(str)),
    source: z.string().max(100)
  })).max(50, 'Too many sources')
});

// RSS feed validation
export const rssFeedSchema = z.object({
  url: z.string().url('Invalid RSS URL'),
  title: z.string().max(200),
  description: z.string().max(1000).optional(),
  link: z.string().optional(),
  pubDate: z.date().optional(),
  content: z.string().max(10000).optional()
});

// Daily news digest validation
export const dailyNewsContentSchema = z.object({
  title: z.string().max(200),
  summary: z.string().max(500),
  topStories: z.array(z.object({
    headline: z.string().max(150),
    summary: z.string().max(300),
    category: z.string().max(50),
    url: z.string(),
  })).max(5),
  marketHighlights: z.array(z.string().max(200)).max(3),
  economicIndicators: z.array(z.string().max(200)).max(3),
  generatedAt: z.string().optional()
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip: z.string().ip(),
  endpoint: z.string().max(100),
  timestamp: z.date(),
  count: z.number().int().positive()
});

// Environment variables validation
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3000'),
  RESEND_API_KEY: z.string().min(1, 'Resend API key required'),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, 'Google Generative AI API key required'),
  NEWS_API_KEY: z.string().optional(),
  RSS_FEED_URLS: z.string().default('').transform(str => str.split(',').filter(Boolean)),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  DATABASE_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key required').optional(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('6379'),
  REDIS_DB: z.string().transform(Number).pipe(z.number().int().positive()).default('0'),
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().int().positive()).default('100'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).pipe(z.number().int().positive()).default('3600000'), // 1 hour
  DEFAULT_FROM_EMAIL: z.string().email().default('arnoldmusandu@gmail.com'),
  DEFAULT_FROM_NAME: z.string().default('The Economist Newsletter')
});

// Export types from schemas
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;
export type NewsletterContent = z.infer<typeof newsletterContentSchema>;
export type RssFeedItem = z.infer<typeof rssFeedSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type RateLimitData = z.infer<typeof rateLimitSchema>;
export type EnvConfig = z.infer<typeof envSchema>;
export type NewsArticle = z.infer<typeof newsArticleSchema>;
export type DailyNewsContent = z.infer<typeof dailyNewsContentSchema>;
