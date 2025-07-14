import { SubscribeInput, UnsubscribeInput, NewsletterContent, RssFeedItem,NewsArticle, DailyNewsContent } from '../../schemas/validation.schemas';

// Newsletter service interface
export interface INewsletterService {
  subscribe(data: SubscribeInput): Promise<{ success: boolean; message: string }>;
  unsubscribe(data: UnsubscribeInput): Promise<{ success: boolean; message: string }>;
  getSubscribers(listIds?: number[]): Promise<any[]>;
  sendNewsletter(content: NewsletterContent, recipients: string[]): Promise<{ sent: number; failed: number }>;
  updatePreferences(email: string, preferences: any): Promise<{ success: boolean }>;
}

// News aggregation service interface
export interface INewsAggregationService {
  fetchRssFeeds(): Promise<RssFeedItem[]>;
  filterEconomicNews(items: RssFeedItem[]): Promise<RssFeedItem[]>;
  deduplicateNews(items: RssFeedItem[]): Promise<RssFeedItem[]>;
  categorizeNews(items: RssFeedItem[]): Promise<RssFeedItem[]>;
  storeNews(items: RssFeedItem[]): Promise<void>;
  getCachedNews(date?: string): Promise<RssFeedItem[]>;
  getNewsStats(date?: string): Promise<any>;
}

// AI content generation service interface
export interface IAIContentService {
  generateNewsletterContent(newsItems: RssFeedItem[], type: 'weekly_preview' | 'weekly_review'): Promise<NewsletterContent>;
  summarizeArticles(articles: RssFeedItem[]): Promise<string>;
  generateArticle(article: RssFeedItem[]): Promise<NewsArticle>;
  generateHeadlines(content: string): Promise<string[]>;
  moderateContent(content: string): Promise<{ approved: boolean; reason?: string }>;
  generateDailyNewsContent(newsItems: RssFeedItem[], date?: Date): Promise<DailyNewsContent>;
}

// Email service interface
export interface IEmailService {
  subscribeToNewsletter(email: string, firstName?: string, lastName?: string, listIds?: number[]): Promise<{ success: boolean; message: string }>;
  unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; message: string }>;
  sendNewsletter(content: NewsletterContent, recipients?: string[]): Promise<{ sent: number; failed: number }>;
  sendDailyNewsletter(content: DailyNewsContent, recipients?: string[]): Promise<{ sent: number; failed: number }>;
  sendWelcomeEmail(email: string, name?: string): Promise<boolean>;
  sendUnsubscribeConfirmation(email: string): Promise<boolean>;
  generateUnsubscribeLink(email: string): Promise<string>;
}

// Storage service interface - MVP focused
export interface IStorageService {
  // Basic Article Management
  saveNewsArticle(article: NewsArticle): Promise<string>;
  getNewsArticle(id: string): Promise<NewsArticle | null>;
  getLatestNews(limit: number, offset?: number): Promise<NewsArticle[]>;
  searchArticles(query: string, options?: { 
    limit?: number; 
    offset?: number; 
  }): Promise<{ articles: NewsArticle[]; total: number }>;
  
  // Daily News Content (Core MVP feature)
  saveDailyNewsContent(content: DailyNewsContent, date?: Date): Promise<string>;
  getDailyNewsContent(date?: Date): Promise<DailyNewsContent | null>;
  
  // Simple Newsletter Subscriptions (Anonymous signup for MVP)
  savePublicNewsletterSignup(email: string): Promise<{ id: string; confirmationToken: string }>;
  confirmNewsletterSignup(token: string): Promise<boolean>;
  unsubscribeFromNewsletter(email: string): Promise<boolean>;
  getConfirmedSubscribers(): Promise<Array<{ id: string; email: string }>>;
  
  // Basic Email Delivery Tracking
  recordEmailDelivery(deliveryData: {
    email: string;
    trackingId: string;
    content?: string; // Simple content reference
  }): Promise<string>;
  updateEmailDeliveryStatus(trackingId: string, status: 'sent' | 'delivered' | 'failed'): Promise<void>;
  
  // Bulk Operations for RSS processing
  saveNewsItems(items: RssFeedItem[]): Promise<void>;
  
  // Basic cleanup
  cleanupOldData(olderThanDays: number): Promise<number>;
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
  getResendApiKey(): string;
  getGoogleGenerativeAIApiKey(): string;
  getJwtSecret(): string;
  getDatabaseUrl(): string | undefined;
  getRedisUrl(): string;
  getRedisPassword(): string | undefined;
  getRedisHost(): string;
  getRedisPort(): number;
  getRedisDb(): number;
  getRateLimitConfig(): { max: number; window: number };

  // Supabase configuration getters
  getSupabaseUrl(): string;
  getSupabaseAnonKey(): string;
  
  // Email configuration getters
  getDefaultFromEmail(): string;
  getDefaultFromName(): string;

  // Newsletter configuration getters
  getNewsApiKey(): string | undefined;
  getRssFeedUrls(): string[];
}

// Redis service interface
export interface IRedisService {
  getClient(): Promise<InstanceType<typeof import('ioredis').default> | null>;
  isConnected(): boolean;
  getStats(): { isConnected: boolean; connectionCount: number; isInitialized: boolean };
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
}

// Supabase service interface for Clerk integration
export interface ISupabaseService {
  getClient(token?: string): any; // Returns Supabase client with optional RLS context
  setAuthToken(token: string): void; // Set Clerk session token for RLS
  clearAuthToken(): void; // Clear auth context
  isAuthenticated(): boolean; // Check if user is authenticated
}
