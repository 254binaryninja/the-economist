import { Container } from 'inversify';
import { 
  IConfigService, 
  IEmailService,
  IRedisService,
  INewsAggregationService,
  IAIContentService,
  ISupabaseService,
  IStorageService
} from '../repository/interfaces';
import { ConfigService } from '../domain/config.service';
import { EmailService } from '../domain/email/email.service';
import { EmailProviderService } from '../domain/email/email-provider.service';
import { NewsletterEmailService } from '../domain/email/newsletter-email.service';
import { SubscriptionEmailService } from '../domain/email/subscription-email.service';
import { SubscriberManagementService } from '../domain/email/subscriber-management.service';
import { RedisService } from '../../plugins/redisManager';
import { NewsAggregationService } from '../domain/news-aggregation.service';
import { SupabaseService } from '../../plugins/supabase';
import { StorageService } from '../domain/storage/storage.service';
import { ArticleStorageService } from '../domain/storage/article-storage.service';
import { NewsletterStorageService } from '../domain/storage/newsletter-storage.service';
import { DailyNewsStorageService } from '../domain/storage/daily-news-storage.service';

import { TYPES } from './types';
import { AIContentService } from '../domain/ai-content.service';

// Create and configure the container
const container = new Container();

// Bind services to their implementations
container.bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
container.bind<IRedisService>(TYPES.RedisService).to(RedisService).inSingletonScope();
container.bind<INewsAggregationService>(TYPES.NewsAggregationService).to(NewsAggregationService).inSingletonScope();
container.bind<IAIContentService>(TYPES.AIContentService).to(AIContentService).inSingletonScope();
container.bind<ISupabaseService>(TYPES.SupabaseService).to(SupabaseService).inSingletonScope();

// Email services - specialized services
container.bind<EmailProviderService>(TYPES.EmailProviderService).to(EmailProviderService).inSingletonScope();
container.bind<NewsletterEmailService>(TYPES.NewsletterEmailService).to(NewsletterEmailService).inSingletonScope();
container.bind<SubscriptionEmailService>(TYPES.SubscriptionEmailService).to(SubscriptionEmailService).inSingletonScope();
container.bind<SubscriberManagementService>(TYPES.SubscriberManagementService).to(SubscriberManagementService).inSingletonScope();

// Main email service facade
container.bind<IEmailService>(TYPES.EmailService).to(EmailService).inSingletonScope();

// Storage services - specialized services
container.bind<ArticleStorageService>(TYPES.ArticleStorageService).to(ArticleStorageService).inSingletonScope();
container.bind<NewsletterStorageService>(TYPES.NewsletterStorageService).to(NewsletterStorageService).inSingletonScope();
container.bind<DailyNewsStorageService>(TYPES.DailyNewsStorageService).to(DailyNewsStorageService).inSingletonScope();

// Main storage service facade
container.bind<IStorageService>(TYPES.StorageService).to(StorageService).inSingletonScope();

// Add other services as you create them
// container.bind<IAIContentService>(TYPES.AIContentService).to(AIContentService);

export { container, TYPES };
