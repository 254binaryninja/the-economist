import { FastifyInstance } from 'fastify'
import { TYPES } from '../../config/types'
import type { INewsAggregationService, IAIContentService, IEmailService } from '../../repository/interfaces'
import type { CronJobResult } from './types'
import { isDevelopmentMode, getSubscribers, validateServices } from './utils'

export async function runWeeklyPreviewJob(fastify: FastifyInstance): Promise<CronJobResult> {
  fastify.log.info('📅 Starting weekly preview newsletter cron job...')
  
  try {
    // First, validate that all required services are available
    fastify.log.info('🔍 Validating DI container services...')
    validateServices(fastify)
    
    // Get service instances from DI container
    fastify.log.info('🔧 Getting service instances from DI container...')
    let newsService, aiService, emailService
    
    try {
      newsService = fastify.container.get<INewsAggregationService>(TYPES.NewsAggregationService)
      fastify.log.debug('✅ Got NewsAggregationService')
    } catch (error) {
      throw new Error(`Failed to get NewsAggregationService: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    try {
      aiService = fastify.container.get<IAIContentService>(TYPES.AIContentService)
      fastify.log.debug('✅ Got AIContentService')
    } catch (error) {
      throw new Error(`Failed to get AIContentService: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    try {
      emailService = fastify.container.get<IEmailService>(TYPES.EmailService)
      fastify.log.debug('✅ Got EmailService')
    } catch (error) {
      throw new Error(`Failed to get EmailService: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Development optimization
    const isDev = isDevelopmentMode()
    fastify.log.info(`🔧 Running in ${isDev ? 'development' : 'production'} mode`)

    // Step 1: Get cached news from the past week
    fastify.log.info('📚 Retrieving past week\'s news...')
    const weekNews = []
    
    try {
      // Get news from the past 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        fastify.log.debug(`📰 Fetching cached news for ${dateStr}`)
        const dayNews = await newsService.getCachedNews(dateStr)
        weekNews.push(...dayNews)
        fastify.log.debug(`📊 Found ${dayNews.length} items for ${dateStr}`)
      }
    } catch (cacheError) {
      fastify.log.warn('Failed to fetch cached news:', {
        error: cacheError instanceof Error ? cacheError.message : String(cacheError),
        stack: cacheError instanceof Error ? cacheError.stack : undefined
      })
    }

    fastify.log.info(`📊 Total cached news items found: ${weekNews.length}`)

    if (weekNews.length === 0) {
      fastify.log.warn('No cached news found for the past week, fetching fresh news...')
      try {
        const freshNews = await newsService.fetchRssFeeds()
        fastify.log.info(`📥 Fetched ${freshNews.length} fresh news items`)
        
        const filteredNews = await newsService.filterEconomicNews(freshNews)
        fastify.log.info(`🎯 Filtered to ${filteredNews.length} economic news items`)
        
        const uniqueNews = await newsService.deduplicateNews(filteredNews)
        fastify.log.info(`🔄 Deduplicated to ${uniqueNews.length} unique items`)
        
        const categorizedNews = await newsService.categorizeNews(uniqueNews)
        fastify.log.info(`📊 Categorized ${categorizedNews.length} items`)
        
        weekNews.push(...categorizedNews)
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
    fastify.log.info(`📝 Processing ${newsToProcess.length} news items for weekly preview${isDev ? ' (dev limited)' : ''}`)

    if (newsToProcess.length === 0) {
      fastify.log.warn('No news items to process for weekly preview')
      return { success: true, duration: 0, metrics: { itemsProcessed: 0, emailsSent: 0, emailsFailed: 0 } }
    }

    // Step 2: Generate weekly preview content
    fastify.log.info(`🤖 Generating weekly preview from ${newsToProcess.length} news items...`)
    let weeklyContent
    try {
      weeklyContent = await aiService.generateNewsletterContent(newsToProcess, 'weekly_preview')
      fastify.log.info(`📝 Generated weekly preview: "${weeklyContent.title}"`)
    } catch (aiError) {
      fastify.log.error('Failed to generate weekly preview content:', {
        error: aiError instanceof Error ? aiError.message : String(aiError),
        stack: aiError instanceof Error ? aiError.stack : undefined,
        newsItemCount: newsToProcess.length
      })
      throw new Error(`AI content generation failed: ${aiError instanceof Error ? aiError.message : String(aiError)}`)
    }

    // Step 3: Get all subscribers
    fastify.log.info('👥 Fetching newsletter subscribers...')
    let subscribers
    try {
      subscribers = await getSubscribers(fastify)
    } catch (subscriberError) {
      fastify.log.error('Failed to fetch subscribers:', {
        error: subscriberError instanceof Error ? subscriberError.message : String(subscriberError),
        stack: subscriberError instanceof Error ? subscriberError.stack : undefined
      })
      throw new Error(`Failed to fetch subscribers: ${subscriberError instanceof Error ? subscriberError.message : String(subscriberError)}`)
    }
    
    if (subscribers.length === 0) {
      fastify.log.warn('No newsletter subscribers found')
      return { success: true, duration: 0, metrics: { itemsProcessed: newsToProcess.length, emailsSent: 0, emailsFailed: 0 } }
    }

    // Development optimization: limit emails
    const subscribersToEmail = isDev ? subscribers.slice(0, 3) : subscribers
    fastify.log.info(`📧 Sending weekly preview to ${subscribersToEmail.length} subscribers${isDev ? ' (dev limited)' : ''}...`)

    // Step 4: Send weekly preview newsletter
    fastify.log.info(`📧 Sending weekly preview to ${subscribersToEmail.length} subscribers${isDev ? ' (dev limited)' : ''}...`)
    let result
    try {
      result = await emailService.sendNewsletter(weeklyContent, subscribersToEmail)
      fastify.log.info(`📬 Email sending result: ${result.sent} sent, ${result.failed} failed`)
    } catch (emailError) {
      fastify.log.error('Failed to send weekly preview emails:', {
        error: emailError instanceof Error ? emailError.message : String(emailError),
        stack: emailError instanceof Error ? emailError.stack : undefined,
        subscriberCount: subscribersToEmail.length
      })
      throw new Error(`Email sending failed: ${emailError instanceof Error ? emailError.message : String(emailError)}`)
    }

    fastify.log.info(`✅ Weekly preview completed successfully`, {
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
    fastify.log.error('❌ Weekly preview cron job failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      step: 'unknown'
    })
    return {
      success: false,
      duration: 0,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
