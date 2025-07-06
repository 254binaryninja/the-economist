import { Container } from 'inversify';
import { 
  IConfigService, 
  IEmailService, 
  INewsAggregationService,
  IAIContentService,
  IStorageService,
  IRateLimitService,
  IAuthService,
  IMonitoringService
} from '../interfaces/services.interfaces';

import { ConfigService } from '../services/config.service';
import { EmailService } from '../services/email.service';

// Service Identifiers (tokens)
export const TYPES = {
  ConfigService: Symbol.for('ConfigService'),
  EmailService: Symbol.for('EmailService'),
  NewsAggregationService: Symbol.for('NewsAggregationService'),
  AIContentService: Symbol.for('AIContentService'),
  StorageService: Symbol.for('StorageService'),
  RateLimitService: Symbol.for('RateLimitService'),
  AuthService: Symbol.for('AuthService'),
  MonitoringService: Symbol.for('MonitoringService')
};

// Create and configure the container
const container = new Container();

// Bind services to their implementations
container.bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
container.bind<IEmailService>(TYPES.EmailService).to(EmailService).inTransientScope();

// Add other services as you create them
// container.bind<INewsAggregationService>(TYPES.NewsAggregationService).to(NewsAggregationService);
// container.bind<IAIContentService>(TYPES.AIContentService).to(AIContentService);

export { container };
