import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../../../services/config/inversify.config';
import { TYPES } from '../../../../services/config/types';
import { INewsAggregationService, IAIContentService } from '../../../../services/repository/interfaces';

const newsRoute: FastifyPluginAsync = async (fastify) => {
  
  // Fetch and aggregate news from all sources
  fastify.get('/aggregate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const newsService = container.get(TYPES.NewsAggregationService) as INewsAggregationService;
      
      fastify.log.info('Starting news aggregation...');
      
      // Fetch from all sources (RSS + NewsAPI)
      const rawItems = await newsService.fetchRssFeeds();
      fastify.log.info(`Fetched ${rawItems.length} raw news items`);
      
      // Filter for economic relevance
      const economicItems = await newsService.filterEconomicNews(rawItems);
      fastify.log.info(`Filtered to ${economicItems.length} economic news items`);
      
      // Remove duplicates
      const uniqueItems = await newsService.deduplicateNews(economicItems);
      fastify.log.info(`Deduplicated to ${uniqueItems.length} unique items`);
      
      // Categorize news
      const categorizedItems = await newsService.categorizeNews(uniqueItems);
      
      // Store in cache
      await newsService.storeNews(categorizedItems);
      
      return {
        success: true,
        message: 'News aggregation completed',
        data: {
          totalItems: categorizedItems.length,
          categories: [...new Set(categorizedItems.map((item: any) => item.category))],
          sources: [...new Set(categorizedItems.map(item => new URL(item.url).hostname))],
          items: categorizedItems.slice(0, 20) // Return first 20 items
        }
      };
      
    } catch (error) {
      fastify.log.error('News aggregation error:', error);
      reply.status(500);
      return {
        success: false,
        message: 'Failed to aggregate news',
        error: 'NEWS_AGGREGATION_ERROR'
      };
    }
  });

  // Get cached news for a specific date
  fastify.get('/cached/:date?', async (request: FastifyRequest<{
    Params: { date?: string }
  }>, reply: FastifyReply) => {
    try {
      const newsService = container.get(TYPES.NewsAggregationService) as INewsAggregationService;
      const { date } = request.params;
      
      const cachedItems = await (newsService as any).getCachedNews(date);
      const stats = await (newsService as any).getNewsStats(date);
      
      return {
        success: true,
        data: {
          date: date || new Date().toISOString().split('T')[0],
          stats,
          totalItems: cachedItems.length,
          items: cachedItems
        }
      };
      
    } catch (error) {
      fastify.log.error('Error retrieving cached news:', error);
      reply.status(500);
      return {
        success: false,
        message: 'Failed to retrieve cached news'
      };
    }
  });

  // Get news statistics
  fastify.get('/stats/:date?', async (request: FastifyRequest<{
    Params: { date?: string }
  }>, reply: FastifyReply) => {
    try {
      const newsService = container.get(TYPES.NewsAggregationService) as INewsAggregationService;
      const { date } = request.params;
      
      const stats = await (newsService as any).getNewsStats(date);
      
      if (!stats) {
        reply.status(404);
        return {
          success: false,
          message: 'No statistics found for the specified date'
        };
      }
      
      return {
        success: true,
        data: stats
      };
      
    } catch (error) {
      fastify.log.error('Error retrieving news stats:', error);
      reply.status(500);
      return {
        success: false,
        message: 'Failed to retrieve news statistics'
      };
    }
  });

  // Manual trigger for news aggregation (useful for cron jobs)
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const newsService = container.get(TYPES.NewsAggregationService) as INewsAggregationService;
      
      // Run the full aggregation pipeline
      const rawItems = await newsService.fetchRssFeeds();
      const economicItems = await newsService.filterEconomicNews(rawItems);
      const uniqueItems = await newsService.deduplicateNews(economicItems);
      const categorizedItems = await newsService.categorizeNews(uniqueItems);
      
      await newsService.storeNews(categorizedItems);
      
      fastify.log.info(`News refresh completed: ${categorizedItems.length} items processed`);
      
      return {
        success: true,
        message: 'News refresh completed successfully',
        data: {
          totalProcessed: categorizedItems.length,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      fastify.log.error('News refresh error:', error);
      reply.status(500);
      return {
        success: false,
        message: 'Failed to refresh news'
      };
    }
  });

  // Generate daily news digest
  fastify.get('/daily-digest', async (request: FastifyRequest<{
    Querystring: { date?: string }
  }>, reply: FastifyReply) => {
    try {
      const { date } = request.query;
      fastify.log.info(`Generating daily digest for date: ${date || 'today'}`);
      
      const newsService = container.get(TYPES.NewsAggregationService) as INewsAggregationService;
      const aiService = container.get(TYPES.AIContentService) as IAIContentService;
      
      // Parse and validate date
      let targetDate: Date | undefined;
      if (date) {
        targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
          reply.status(400);
          return {
            success: false,
            message: 'Invalid date format. Use YYYY-MM-DD format.'
          };
        }
        fastify.log.info(`Parsed target date: ${targetDate.toISOString()}`);
      }
      
      // Get cached news for the date
      fastify.log.info('Fetching cached news items...');
      const newsItems = await (newsService as any).getCachedNews(date);
      fastify.log.info(`Retrieved ${newsItems.length} cached news items`);
      
      if (newsItems.length === 0) {
        // Try to fetch fresh news if no cached news found
        if (!date || date === new Date().toISOString().split('T')[0]) {
          fastify.log.info('No cached news found, fetching fresh news...');
          const rawItems = await newsService.fetchRssFeeds();
          fastify.log.info(`Fetched ${rawItems.length} raw items`);
          
          const economicItems = await newsService.filterEconomicNews(rawItems);
          fastify.log.info(`Filtered to ${economicItems.length} economic items`);
          
          const uniqueItems = await newsService.deduplicateNews(economicItems);
          fastify.log.info(`Deduplicated to ${uniqueItems.length} unique items`);
          
          const categorizedItems = await newsService.categorizeNews(uniqueItems);
          fastify.log.info(`Categorized ${categorizedItems.length} items`);
          
          if (categorizedItems.length > 0) {
            await newsService.storeNews(categorizedItems);
            fastify.log.info('Stored news items, generating digest...');
            
            const dailyDigest = await aiService.generateDailyNewsContent(categorizedItems, targetDate);
            fastify.log.info('Successfully generated daily digest from fresh news');
            
            return {
              success: true,
              message: 'Daily digest generated from fresh news',
              data: dailyDigest
            };
          }
        }
        
        reply.status(404);
        return {
          success: false,
          message: `No news found for date ${date || 'today'}`
        };
      }
      
      // Generate daily digest from cached news
      fastify.log.info('Generating daily digest from cached news...');
      const dailyDigest = await aiService.generateDailyNewsContent(newsItems, targetDate);
      fastify.log.info('Successfully generated daily digest from cached news');
      
      return {
        success: true,
        message: 'Daily digest generated successfully',
        data: dailyDigest
      };
      
    } catch (error) {
      fastify.log.error('Error generating daily digest:', error);
      fastify.log.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      reply.status(500);
      return {
        success: false,
        message: 'Failed to generate daily news digest',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
};

export default newsRoute;
