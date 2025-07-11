import { Container } from 'inversify';
import { 
  IConfigService, 
  IEmailService,
  IRedisService,
  INewsAggregationService,
  IAIContentService
} from '../repository/interfaces';
import { ConfigService } from '../domain/config.service';
import { EmailService } from '../domain/email.service';
import { RedisService } from '../../plugins/redisManager';
import { NewsAggregationService } from '../domain/news-aggregation.service';

import { TYPES } from './types';
import { AIContentService } from '../domain/ai-content.service';

// Create and configure the container
const container = new Container();

// Bind services to their implementations
container.bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
container.bind<IEmailService>(TYPES.EmailService).to(EmailService).inTransientScope();
container.bind<IRedisService>(TYPES.RedisService).to(RedisService).inSingletonScope();
container.bind<INewsAggregationService>(TYPES.NewsAggregationService).to(NewsAggregationService).inSingletonScope();
container.bind<IAIContentService>(TYPES.AIContentService).to(AIContentService).inSingletonScope();

// Add other services as you create them
// container.bind<IAIContentService>(TYPES.AIContentService).to(AIContentService);

export { container, TYPES };
