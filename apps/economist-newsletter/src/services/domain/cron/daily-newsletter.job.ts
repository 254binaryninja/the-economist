import { FastifyInstance } from 'fastify'
import { TYPES } from '../../config/types'
import type { INewsAggregationService, IAIContentService, IEmailService, IStorageService } from '../../repository/interfaces'
import type { CronJobResult } from './types'
import { isDevelopmentMode, getDailySubscribers } from './utils'

export async function runDailyNewsletterJob(fastify: FastifyInstance): Promise<CronJobResult> {
  fastify.log.info('📰 Starting daily newsletter cron job...')
  
  try {
    // First, check if fastify.container exists at all
    if (!fastify.container) {
      throw new Error('fastify.container is undefined - container plugin may not be loaded')
    }
    
    fastify.log.debug('📦 Container exists, checking service bindings...')
    
    // Debug: Check what's available in the container
    fastify.log.debug('🔍 Container debug info:', {
      hasNewsService: fastify.container.isBound(TYPES.NewsAggregationService),
      hasAIService: fastify.container.isBound(TYPES.AIContentService),
      hasEmailService: fastify.container.isBound(TYPES.EmailService),
      hasStorageService: fastify.container.isBound(TYPES.StorageService),
      hasConfigService: fastify.container.isBound(TYPES.ConfigService),
      hasSupabaseService: fastify.container.isBound(TYPES.SupabaseService)
    })
    
    // Get service instances from DI container with detailed error handling
    fastify.log.debug('📦 Getting service instances from DI container...')
    
    let newsService, aiService, emailService, storageService
    
    try {
      newsService = fastify.container.get<INewsAggregationService>(TYPES.NewsAggregationService)
      fastify.log.debug('✅ Got NewsAggregationService')
    } catch (error) {
      fastify.log.error('❌ Failed to get NewsAggregationService:', error)
      throw error
    }
    
    try {
      aiService = fastify.container.get<IAIContentService>(TYPES.AIContentService)
      fastify.log.debug('✅ Got AIContentService')
    } catch (error) {
      fastify.log.error('❌ Failed to get AIContentService:', error)
      throw error
    }
    
    try {
      emailService = fastify.container.get<IEmailService>(TYPES.EmailService)
      fastify.log.debug('✅ Got EmailService')
    } catch (error) {
      fastify.log.error('❌ Failed to get EmailService:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : 'Unknown',
        TYPES_EmailService: TYPES.EmailService.toString()
      })
      throw error
    }
    
    try {
      storageService = fastify.container.get<IStorageService>(TYPES.StorageService)
      fastify.log.debug('✅ Got StorageService')
    } catch (error) {
      fastify.log.error('❌ Failed to get StorageService:', error)
      throw error
    }

    // Development optimization
    const isDev = isDevelopmentMode()
    fastify.log.info(`🔧 Running in ${isDev ? 'development' : 'production'} mode`)

    // Step 1: Fetch fresh news
    fastify.log.info('📰 Fetching fresh RSS feeds...')
    const rawNews = await newsService.fetchRssFeeds()
    fastify.log.info(`📥 Fetched ${rawNews.length} raw news items`)
    
    if (rawNews.length === 0) {
      fastify.log.warn('No news items fetched for daily newsletter')
      return { success: true, duration: 0, metrics: { itemsProcessed: 0, emailsSent: 0, emailsFailed: 0 } }
    }

    // Step 2: Process news (limit for dev)
    const limitedNews = isDev ? rawNews.slice(0, 30) : rawNews
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

    // Step 4: Generate daily newsletter content using AI
    fastify.log.info('🤖 Generating daily newsletter content with AI...')
    const dailyContent = await aiService.generateDailyNewsContent(categorizedNews)
    fastify.log.info(`📝 Generated newsletter content: "${dailyContent.title}"`)

    // Step 5: Save daily content to storage
    fastify.log.info('💾 Saving daily content to storage...')
    await storageService.saveDailyNewsContent(dailyContent)

    // Step 6: Get subscribers who want daily newsletters
    fastify.log.info('👥 Fetching daily newsletter subscribers...')
    const dailySubscribers = await getDailySubscribers(fastify)
    
    if (dailySubscribers.length === 0) {
      fastify.log.warn('No daily newsletter subscribers found')
      return { success: true, duration: 0, metrics: { itemsProcessed: categorizedNews.length, emailsSent: 0, emailsFailed: 0 } }
    }

    // Development optimization: limit emails sent for testing
    const subscribersToEmail = isDev ? dailySubscribers.slice(0, 3) : dailySubscribers
    fastify.log.info(`📧 Sending daily newsletter to ${subscribersToEmail.length} subscribers${isDev ? ' (dev limited)' : ''}...`)

    // Step 7: Send daily newsletter
    const result = await emailService.sendDailyNewsletter(dailyContent, subscribersToEmail)
    fastify.log.info(`📬 Email sending result: ${result.sent} sent, ${result.failed} failed`)

    // Step 8: Record email delivery tracking
    fastify.log.info('📊 Recording email delivery tracking...')
    let trackingRecorded = 0
    for (const email of subscribersToEmail) {
      try {
        const trackingId = `daily-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substring(7)}`
        await storageService.recordEmailDelivery({
          email,
          trackingId,
          content: `Daily Newsletter - ${dailyContent.title}`
        })
        trackingRecorded++
      } catch (error) {
        fastify.log.warn(`Failed to record delivery tracking for ${email}:`, {
          email,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    fastify.log.info(`✅ Daily newsletter completed successfully`, {
      itemsProcessed: categorizedNews.length,
      emailsSent: result.sent,
      emailsFailed: result.failed,
      trackingRecorded,
      isDevelopment: isDev
    })

    return {
      success: true,
      duration: 0,
      metrics: {
        itemsProcessed: categorizedNews.length,
        emailsSent: result.sent,
        emailsFailed: result.failed
      }
    }

  } catch (error) {
    fastify.log.error('❌ Daily newsletter cron job failed:', {
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
