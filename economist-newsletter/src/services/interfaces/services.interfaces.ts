import { SubscribeInput, UnsubscribeInput, NewsletterContent, RssFeedItem } from '../../schemas/validation.schemas';

// Newsletter service interface
export interface INewsletterService {
  subscribe(data: SubscribeInput): Promise<{ success: boolean; message: string }>;
  unsubscribe(data: UnsubscribeInput): Promise<{ success: boolean; message: string }>;
  getSubscribers(listIds?: number[]): Promise<any[]>;
  updatePreferences(email: string, preferences: any): Promise<{ success: boolean }>;
}

// News aggregation service interface
export interface INewsAggregationService {
  fetchRssFeeds(): Promise<RssFeedItem[]>;
  filterEconomicNews(items: RssFeedItem[]): Promise<RssFeedItem[]>;
  deduplicateNews(items: RssFeedItem[]): Promise<RssFeedItem[]>;
  categorizeNews(items: RssFeedItem[]): Promise<RssFeedItem[]>;
  storeNews(items: RssFeedItem[]): Promise<void>;
}

// AI content generation service interface
export interface IAIContentService {
  generateNewsletterContent(newsItems: RssFeedItem[], type: 'weekly_preview' | 'weekly_review'): Promise<NewsletterContent>;
  summarizeArticles(articles: RssFeedItem[]): Promise<string>;
  generateHeadlines(content: string): Promise<string[]>;
  moderateContent(content: string): Promise<{ approved: boolean; reason?: string }>;
}

// Email service interface
export interface IEmailService {
  subscribeToNewsletter(email: string, firstName?: string, lastName?: string, listIds?: number[]): Promise<{ success: boolean; message: string }>;
  sendNewsletter(content: NewsletterContent, recipients: string[]): Promise<{ sent: number; failed: number }>;
  sendWelcomeEmail(email: string, name?: string): Promise<boolean>;
  sendUnsubscribeConfirmation(email: string): Promise<boolean>;
  generateUnsubscribeLink(email: string): Promise<string>;
}

// Storage service interface
export interface IStorageService {
  saveNewsletter(content: NewsletterContent): Promise<string>; // returns ID
  getNewsletter(id: string): Promise<NewsletterContent | null>;
  saveNewsItems(items: RssFeedItem[]): Promise<void>;
  getLatestNews(limit: number): Promise<RssFeedItem[]>;
  cleanupOldData(olderThanDays: number): Promise<number>; // returns deleted count
}

// Rate limiting service interface
export interface IRateLimitService {
  checkLimit(ip: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }>;
  recordRequest(ip: string, endpoint: string): Promise<void>;
  clearLimits(ip?: string): Promise<void>;
}

// Authentication service interface
export interface IAuthService {
  generateToken(payload: any): Promise<string>;
  verifyToken(token: string): Promise<any>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}

// Monitoring service interface
export interface IMonitoringService {
  logEvent(event: string, data?: any): Promise<void>;
  logError(error: Error, context?: any): Promise<void>;
  logSecurityEvent(event: string, ip: string, details?: any): Promise<void>;
  getMetrics(): Promise<any>;
}

// Configuration service interface
export interface IConfigService {
  get<T>(key: string): T;
  getAll(): Record<string, any>;
  validate(): Promise<boolean>;
  reload(): Promise<void>;
  
  // Environment utility methods
  isDevelopment(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
  getPort(): number;
  
  // Secure API key getters
  getBrevoApiKey(): string;
  getGoogleGenerativeAIApiKey(): string;
  getJwtSecret(): string;
  getDatabaseUrl(): string | undefined;
  getRedisUrl(): string;
  getRedisPassword(): string | undefined;
  getRedisHost(): string;
  getRedisPort(): number;
  getRedisDb(): number;
  getRateLimitConfig(): { max: number; window: number };
  
  // Email configuration getters
  getDefaultFromEmail(): string;
  getDefaultFromName(): string;
}
