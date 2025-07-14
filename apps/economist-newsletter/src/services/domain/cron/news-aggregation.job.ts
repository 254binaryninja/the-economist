import { FastifyInstance } from 'fastify'
import { TYPES } from '../../config/types'
import type { INewsAggregationService } from '../../repository/interfaces'
import type { CronJobResult } from './types'
import { isDevelopmentMode } from './utils'

export async function runNewsAggregationJob(fastify: FastifyInstance): Promise<CronJobResult> {
  fastify.log.info('🔄 Starting news aggregation cron job...')
  
  try {
    // Get service instances from DI container
    const newsService = fastify.container.get<INewsAggregationService>(TYPES.NewsAggregationService)

    // Development optimization
    const isDev = isDevelopmentMode()
    const maxNewsItems = isDev ? 20 : 200

    // Step 1: Fetch fresh news
    fastify.log.info('📰 Fetching fresh RSS feeds...')
    const rawNews = await newsService.fetchRssFeeds()
    fastify.log.info(`📥 Fetched ${rawNews.length} raw news items`)
    
    if (rawNews.length === 0) {
      fastify.log.warn('No news items fetched during aggregation')
      return { success: true, duration: 0, metrics: { itemsProcessed: 0 } }
    }

    // Step 2: Process news (limit for dev)
    const limitedNews = isDev ? rawNews.slice(0, maxNewsItems) : rawNews
    fastify.log.info(`🔍 Processing ${limitedNews.length} news items${isDev ? ' (dev limited)' : ''}...`)
    
    const filteredNews = await newsService.filterEconomicNews(limitedNews)
    fastify.log.info(`🎯 Filtered to ${filteredNews.length} economic news items`)
    
    const uniqueNews = await newsService.deduplicateNews(filteredNews)
    fastify.log.info(`🔄 Deduplicated to ${uniqueNews.length} unique items`)
    
    const categorizedNews = await newsService.categorizeNews(uniqueNews)
    fastify.log.info(`📊 Categorized ${categorizedNews.length} items`)

    // Step 3: Store processed news
    fastify.log.info('💾 Storing processed news...')
    await newsService.storeNews(categorizedNews)

    fastify.log.info(`✅ News aggregation completed successfully`, {
      itemsProcessed: categorizedNews.length,
      rawItems: rawNews.length,
      filteredItems: filteredNews.length,
      uniqueItems: uniqueNews.length,
      isDevelopment: isDev
    })

    return {
      success: true,
      duration: 0,
      metrics: {
        itemsProcessed: categorizedNews.length
      }
    }

  } catch (error) {
    fastify.log.error('❌ News aggregation cron job failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return {
      success: false,
      duration: 0,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
