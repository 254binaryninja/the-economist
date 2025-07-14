// Service Identifiers (tokens) for dependency injection
export const TYPES = {
  ConfigService: Symbol.for('ConfigService'),
  EmailService: Symbol.for('EmailService'),
  RedisService: Symbol.for('RedisService'),
  NewsAggregationService: Symbol.for('NewsAggregationService'),
  AIContentService: Symbol.for('AIContentService'),
  StorageService: Symbol.for('StorageService'),
  RateLimitService: Symbol.for('RateLimitService'),
  AuthService: Symbol.for('AuthService'),
  MonitoringService: Symbol.for('MonitoringService'),
  SupabaseService: Symbol.for('SupabaseService')
};
