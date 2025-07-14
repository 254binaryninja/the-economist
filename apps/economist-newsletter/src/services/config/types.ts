// Service Identifiers (tokens) for dependency injection
export const TYPES = {
  ConfigService: Symbol.for('ConfigService'),
  EmailService: Symbol.for('EmailService'),
  EmailProviderService: Symbol.for('EmailProviderService'),
  NewsletterEmailService: Symbol.for('NewsletterEmailService'),
  SubscriptionEmailService: Symbol.for('SubscriptionEmailService'),
  SubscriberManagementService: Symbol.for('SubscriberManagementService'),
  RedisService: Symbol.for('RedisService'),
  NewsAggregationService: Symbol.for('NewsAggregationService'),
  AIContentService: Symbol.for('AIContentService'),
  StorageService: Symbol.for('StorageService'),
  ArticleStorageService: Symbol.for('ArticleStorageService'),
  NewsletterStorageService: Symbol.for('NewsletterStorageService'),
  DailyNewsStorageService: Symbol.for('DailyNewsStorageService'),
  RateLimitService: Symbol.for('RateLimitService'),
  AuthService: Symbol.for('AuthService'),
  MonitoringService: Symbol.for('MonitoringService'),
  SupabaseService: Symbol.for('SupabaseService')
};
