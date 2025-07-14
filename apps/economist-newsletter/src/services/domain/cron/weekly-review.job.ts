import { FastifyInstance } from 'fastify'
import { TYPES } from '../../config/types'
import type { INewsAggregationService, IAIContentService, IEmailService } from '../../repository/interfaces'
import type { CronJobResult } from './types'
import { isDevelopmentMode, getSubscribers } from './utils'

export async function runWeeklyReviewJob(fastify: FastifyInstance): Promise<CronJobResult> {
  fastify.log.info('📊 Starting weekly review newsletter cron job...')
  
  try {
    // Get service instances from DI container with detailed error handling
    fastify.log.debug('📦 Getting service instances from DI container...')
    
    let newsService, aiService, emailService
    
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
      fastify.log.error('❌ Failed to get EmailService:', error)
      throw error
    }

    // Development optimization
    const isDev = isDevelopmentMode()

    // Step 1: Get this week's news (Monday to Friday)
    fastify.log.info('📚 Retrieving this week\'s news...')
    const weekNews = []
    
    try {
      // Get news from Monday to today (Friday)
      const today = new Date()
      const monday = new Date(today)
      monday.setDate(today.getDate() - (today.getDay() - 1)) // Get Monday of current week
      
      fastify.log.info(`📅 Fetching news from Monday ${monday.toISOString().split('T')[0]} to today`)
      
      for (let i = 0; i < 5; i++) { // Monday to Friday
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        
        fastify.log.debug(`📰 Fetching cached news for ${dateStr}`)
        const dayNews = await newsService.getCachedNews(dateStr)
        weekNews.push(...dayNews)
        fastify.log.debug(`📊 Found ${dayNews.length} items for ${dateStr}`)
      }
    } catch (cacheError) {
      fastify.log.warn('Failed to fetch cached news:', {
        error: cacheError instanceof Error ? cacheError.message : String(cacheError)
      })
    }

    if (weekNews.length === 0) {
      fastify.log.warn('No cached news found for this week, fetching fresh news...')
      try {
        const freshNews = await newsService.fetchRssFeeds()
        fastify.log.info(`📥 Fetched ${freshNews.length} fresh news items`)
        
        const processedNews = await newsService.categorizeNews(
          await newsService.deduplicateNews(
            await newsService.filterEconomicNews(freshNews)
          )
        )
        weekNews.push(...processedNews)
        fastify.log.info(`📊 Processed ${processedNews.length} fresh news items`)
      } catch (freshNewsError) {
        fastify.log.error('Failed to fetch fresh news as fallback:', {
          error: freshNewsError instanceof Error ? freshNewsError.message : String(freshNewsError),
          stack: freshNewsError instanceof Error ? freshNewsError.stack : undefined
        })
        throw new Error(`No cached news available and failed to fetch fresh news: ${freshNewsError instanceof Error ? freshNewsError.message : String(freshNewsError)}`)
      }
    }

    // Development optimization: limit news items
    const newsToProcess = isDev ? weekNews.slice(0, 15) : weekNews
    fastify.log.info(`📝 Processing ${newsToProcess.length} news items for weekly review${isDev ? ' (dev limited)' : ''}`)

    // Step 2: Generate weekly review content
    fastify.log.info(`🤖 Generating weekly review from ${newsToProcess.length} news items...`)
    const weeklyContent = await aiService.generateNewsletterContent(newsToProcess, 'weekly_review')
    fastify.log.info(`📝 Generated weekly review: "${weeklyContent.title}"`)

    // Step 3: Get all subscribers
    fastify.log.info('👥 Fetching newsletter subscribers...')
    const subscribers = await getSubscribers(fastify)
    
    if (subscribers.length === 0) {
      fastify.log.warn('No newsletter subscribers found')
      return { success: true, duration: 0, metrics: { itemsProcessed: newsToProcess.length, emailsSent: 0, emailsFailed: 0 } }
    }

    // Development optimization: limit emails
    const subscribersToEmail = isDev ? subscribers.slice(0, 3) : subscribers
    fastify.log.info(`📧 Sending weekly review to ${subscribersToEmail.length} subscribers${isDev ? ' (dev limited)' : ''}...`)

    // Step 4: Send weekly review newsletter
    const result = await emailService.sendNewsletter(weeklyContent, subscribersToEmail)
    fastify.log.info(`📬 Email sending result: ${result.sent} sent, ${result.failed} failed`)

    fastify.log.info(`✅ Weekly review completed successfully`, {
      itemsProcessed: newsToProcess.length,
      emailsSent: result.sent,
      emailsFailed: result.failed,
      isDevelopment: isDev
    })

    return {
      success: true,
      duration: 0,
      metrics: {
        itemsProcessed: newsToProcess.length,
        emailsSent: result.sent,
        emailsFailed: result.failed
      }
    }

  } catch (error) {
    fastify.log.error('❌ Weekly review cron job failed:', {
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
