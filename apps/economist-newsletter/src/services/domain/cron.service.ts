import { FastifyInstance } from 'fastify'
import { Container } from 'inversify'
import { TYPES } from '../config/types'
import type { INewsAggregationService, IAIContentService, IEmailService } from '../repository/interfaces'

export interface JobStatus {
  name: string
  status: 'success' | 'error' | 'running' | 'scheduled'
  lastRun?: Date
  lastSuccess?: Date
  lastError?: Date
  nextRun?: Date
  errorMessage?: string
  metrics?: {
    duration?: number
    itemsProcessed?: number
    emailsSent?: number
    emailsFailed?: number
  }
}

export interface CronJobResult {
  success: boolean
  duration: number
  metrics?: {
    itemsProcessed?: number
    emailsSent?: number
    emailsFailed?: number
  }
  error?: string
}

export class CronService {
  private fastify: FastifyInstance
  private container: Container
  private jobStatuses: Map<string, JobStatus> = new Map()

  constructor(fastify: FastifyInstance, container: Container) {
    this.fastify = fastify
    this.container = container
    this.initializeJobStatuses()
  }

  private initializeJobStatuses() {
    const jobs = ['dailyNewsletter', 'weeklyPreview', 'weeklyReview', 'newsAggregation', 'cacheCleanup']
    jobs.forEach(jobName => {
      this.jobStatuses.set(jobName, {
        name: jobName,
        status: 'scheduled'
      })
    })
  }

  private updateJobStatus(jobName: string, updates: Partial<JobStatus>) {
    const current = this.jobStatuses.get(jobName) || { name: jobName, status: 'scheduled' }
    this.jobStatuses.set(jobName, { ...current, ...updates })
  }

  private async executeJob(jobName: string, jobFunction: () => Promise<CronJobResult>): Promise<void> {
    const startTime = Date.now()
    this.updateJobStatus(jobName, { status: 'running' })

    try {
      const result = await jobFunction()
      const duration = Date.now() - startTime

      if (result.success) {
        this.updateJobStatus(jobName, {
          status: 'success',
          lastRun: new Date(),
          lastSuccess: new Date(),
          metrics: {
            duration,
            ...result.metrics
          }
        })
      } else {
        this.updateJobStatus(jobName, {
          status: 'error',
          lastRun: new Date(),
          lastError: new Date(),
          errorMessage: result.error,
          metrics: {
            duration,
            ...result.metrics
          }
        })
      }
    } catch (error) {
      const duration = Date.now() - startTime
      this.updateJobStatus(jobName, {
        status: 'error',
        lastRun: new Date(),
        lastError: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error),
        metrics: { duration }
      })
      throw error
    }
  }

  // Placeholder function to get subscribers from database
  private async getSubscribers(): Promise<string[]> {
    // TODO: Implement database query to get active subscribers
    // For now, return placeholder emails for testing
    this.fastify.log.info('Fetching subscribers from database...')
    return [
      'test1@example.com',
      'test2@example.com',
      'admin@the-economist.app'
    ]
  }

  // Placeholder function to get daily newsletter subscribers
  private async getDailySubscribers(): Promise<string[]> {
    // TODO: Implement database query to get subscribers who opted for daily newsletters
    // For now, return placeholder emails for testing
    this.fastify.log.info('Fetching daily newsletter subscribers from database...')
    return [
      'daily1@example.com',
      'daily2@example.com',
      'admin@the-economist.app'
    ]
  }

  // Daily Newsletter Job Logic
  async runDailyNewsletter(): Promise<void> {
    await this.executeJob('dailyNewsletter', async (): Promise<CronJobResult> => {
      this.fastify.log.info('🌅 Starting daily newsletter cron job...')
      
      try {
        // Get service instances from DI container
        const newsService = this.container.get<INewsAggregationService>(TYPES.NewsAggregationService)
        const aiService = this.container.get<IAIContentService>(TYPES.AIContentService)
        const emailService = this.container.get<IEmailService>(TYPES.EmailService)

        // Step 1: Fetch and process today's news
        this.fastify.log.info('📰 Fetching RSS feeds...')
        const rawNews = await newsService.fetchRssFeeds()
        
        if (rawNews.length === 0) {
          this.fastify.log.warn('No news items fetched, skipping daily newsletter')
          return { success: true, duration: 0, metrics: { itemsProcessed: 0, emailsSent: 0, emailsFailed: 0 } }
        }

        // Step 2: Filter, deduplicate and categorize news
        this.fastify.log.info(`🔍 Processing ${rawNews.length} news items...`)
        const filteredNews = await newsService.filterEconomicNews(rawNews)
        const uniqueNews = await newsService.deduplicateNews(filteredNews)
        const categorizedNews = await newsService.categorizeNews(uniqueNews)

        this.fastify.log.info(`📊 Processed news: ${rawNews.length} → ${filteredNews.length} → ${uniqueNews.length} → ${categorizedNews.length}`)

        // Step 3: Store processed news
        await newsService.storeNews(categorizedNews)

        // Step 4: Generate daily newsletter content using AI
        this.fastify.log.info('🤖 Generating daily newsletter content with AI...')
        const dailyContent = await aiService.generateDailyNewsContent(categorizedNews)

        // Step 5: Get subscribers who want daily newsletters
        const dailySubscribers = await this.getDailySubscribers()
        
        if (dailySubscribers.length === 0) {
          this.fastify.log.warn('No daily newsletter subscribers found')
          return { success: true, duration: 0, metrics: { itemsProcessed: categorizedNews.length, emailsSent: 0, emailsFailed: 0 } }
        }

        // Step 6: Send daily newsletter
        this.fastify.log.info(`📧 Sending daily newsletter to ${dailySubscribers.length} subscribers...`)
        const result = await emailService.sendDailyNewsletter(dailyContent, dailySubscribers)

        this.fastify.log.info(`✅ Daily newsletter completed: ${result.sent} sent, ${result.failed} failed`)

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
        this.fastify.log.error('❌ Daily newsletter cron job failed:', error)
        return {
          success: false,
          duration: 0,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
  }

  // Weekly Preview Job Logic
  async runWeeklyPreview(): Promise<void> {
    await this.executeJob('weeklyPreview', async (): Promise<CronJobResult> => {
      this.fastify.log.info('📅 Starting weekly preview newsletter cron job...')
      
      try {
        // Get service instances from DI container
        const newsService = this.container.get<INewsAggregationService>(TYPES.NewsAggregationService)
        const aiService = this.container.get<IAIContentService>(TYPES.AIContentService)
        const emailService = this.container.get<IEmailService>(TYPES.EmailService)

        // Step 1: Get cached news from the past week
        this.fastify.log.info('📚 Retrieving past week\'s news...')
        const weekNews = []
        
        // Get news from the past 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayNews = await newsService.getCachedNews(date.toISOString().split('T')[0])
          weekNews.push(...dayNews)
        }

        if (weekNews.length === 0) {
          this.fastify.log.warn('No cached news found for the past week, fetching fresh news...')
          const freshNews = await newsService.fetchRssFeeds()
          const processedNews = await newsService.categorizeNews(
            await newsService.deduplicateNews(
              await newsService.filterEconomicNews(freshNews)
            )
          )
          weekNews.push(...processedNews)
        }

        // Step 2: Generate weekly preview content
        this.fastify.log.info(`🤖 Generating weekly preview from ${weekNews.length} news items...`)
        const weeklyContent = await aiService.generateNewsletterContent(weekNews, 'weekly_preview')

        // Step 3: Get all subscribers
        const subscribers = await this.getSubscribers()
        
        if (subscribers.length === 0) {
          this.fastify.log.warn('No newsletter subscribers found')
          return { success: true, duration: 0, metrics: { itemsProcessed: weekNews.length, emailsSent: 0, emailsFailed: 0 } }
        }

        // Step 4: Send weekly preview newsletter
        this.fastify.log.info(`📧 Sending weekly preview to ${subscribers.length} subscribers...`)
        const result = await emailService.sendNewsletter(weeklyContent, subscribers)

        this.fastify.log.info(`✅ Weekly preview completed: ${result.sent} sent, ${result.failed} failed`)

        return {
          success: true,
          duration: 0,
          metrics: {
            itemsProcessed: weekNews.length,
            emailsSent: result.sent,
            emailsFailed: result.failed
          }
        }

      } catch (error) {
        this.fastify.log.error('❌ Weekly preview cron job failed:', error)
        return {
          success: false,
          duration: 0,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
  }

  // Weekly Review Job Logic
  async runWeeklyReview(): Promise<void> {
    await this.executeJob('weeklyReview', async (): Promise<CronJobResult> => {
      this.fastify.log.info('📊 Starting weekly review newsletter cron job...')
      
      try {
        // Get service instances from DI container
        const newsService = this.container.get<INewsAggregationService>(TYPES.NewsAggregationService)
        const aiService = this.container.get<IAIContentService>(TYPES.AIContentService)
        const emailService = this.container.get<IEmailService>(TYPES.EmailService)

        // Step 1: Get this week's news (Monday to Friday)
        this.fastify.log.info('📚 Retrieving this week\'s news...')
        const weekNews = []
        
        // Get news from Monday to today (Friday)
        const today = new Date()
        const monday = new Date(today)
        monday.setDate(today.getDate() - (today.getDay() - 1)) // Get Monday of current week
        
        for (let i = 0; i < 5; i++) { // Monday to Friday
          const date = new Date(monday)
          date.setDate(monday.getDate() + i)
          const dayNews = await newsService.getCachedNews(date.toISOString().split('T')[0])
          weekNews.push(...dayNews)
        }

        if (weekNews.length === 0) {
          this.fastify.log.warn('No cached news found for this week, fetching fresh news...')
          const freshNews = await newsService.fetchRssFeeds()
          const processedNews = await newsService.categorizeNews(
            await newsService.deduplicateNews(
              await newsService.filterEconomicNews(freshNews)
            )
          )
          weekNews.push(...processedNews)
        }

        // Step 2: Generate weekly review content
        this.fastify.log.info(`🤖 Generating weekly review from ${weekNews.length} news items...`)
        const weeklyContent = await aiService.generateNewsletterContent(weekNews, 'weekly_review')

        // Step 3: Get all subscribers
        const subscribers = await this.getSubscribers()
        
        if (subscribers.length === 0) {
          this.fastify.log.warn('No newsletter subscribers found')
          return { success: true, duration: 0, metrics: { itemsProcessed: weekNews.length, emailsSent: 0, emailsFailed: 0 } }
        }

        // Step 4: Send weekly review newsletter
        this.fastify.log.info(`📧 Sending weekly review to ${subscribers.length} subscribers...`)
        const result = await emailService.sendNewsletter(weeklyContent, subscribers)

        this.fastify.log.info(`✅ Weekly review completed: ${result.sent} sent, ${result.failed} failed`)

        return {
          success: true,
          duration: 0,
          metrics: {
            itemsProcessed: weekNews.length,
            emailsSent: result.sent,
            emailsFailed: result.failed
          }
        }

      } catch (error) {
        this.fastify.log.error('❌ Weekly review cron job failed:', error)
        return {
          success: false,
          duration: 0,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
  }

  // News Aggregation Job Logic
  async runNewsAggregation(): Promise<void> {
    await this.executeJob('newsAggregation', async (): Promise<CronJobResult> => {
      this.fastify.log.info('🔄 Starting news aggregation cron job...')
      
      try {
        // Get service instances from DI container
        const newsService = this.container.get<INewsAggregationService>(TYPES.NewsAggregationService)

        // Step 1: Fetch fresh news
        this.fastify.log.info('📰 Fetching fresh RSS feeds...')
        const rawNews = await newsService.fetchRssFeeds()
        
        if (rawNews.length === 0) {
          this.fastify.log.warn('No news items fetched during aggregation')
          return { success: true, duration: 0, metrics: { itemsProcessed: 0 } }
        }

        // Step 2: Process news
        this.fastify.log.info(`🔍 Processing ${rawNews.length} news items...`)
        const filteredNews = await newsService.filterEconomicNews(rawNews)
        const uniqueNews = await newsService.deduplicateNews(filteredNews)
        const categorizedNews = await newsService.categorizeNews(uniqueNews)

        // Step 3: Store processed news
        await newsService.storeNews(categorizedNews)

        this.fastify.log.info(`✅ News aggregation completed: ${categorizedNews.length} items stored`)

        return {
          success: true,
          duration: 0,
          metrics: {
            itemsProcessed: categorizedNews.length
          }
        }

      } catch (error) {
        this.fastify.log.error('❌ News aggregation cron job failed:', error)
        return {
          success: false,
          duration: 0,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
  }

  // Cache Cleanup Job Logic
  async runCacheCleanup(): Promise<void> {
    await this.executeJob('cacheCleanup', async (): Promise<CronJobResult> => {
      this.fastify.log.info('🧹 Starting cache cleanup cron job...')
      
      try {
        // TODO: Implement cache cleanup logic
        // - Remove news older than 7 days
        // - Remove old AI-generated content
        // - Clean up newsletter metrics older than 30 days
        
        this.fastify.log.info('Cache cleanup logic to be implemented')
        this.fastify.log.info('✅ Cache cleanup completed')

        return {
          success: true,
          duration: 0,
          metrics: {
            itemsProcessed: 0 // Will be updated when cleanup logic is implemented
          }
        }

      } catch (error) {
        this.fastify.log.error('❌ Cache cleanup cron job failed:', error)
        return {
          success: false,
          duration: 0,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })
  }

  // Status and monitoring methods
  getJobStatus(jobName: string): JobStatus | undefined {
    return this.jobStatuses.get(jobName)
  }

  getAllJobStatuses(): JobStatus[] {
    return Array.from(this.jobStatuses.values())
  }

  updateNextRunTime(jobName: string, nextRun: Date): void {
    this.updateJobStatus(jobName, { nextRun })
  }

  getJobMetrics(): { [key: string]: any } {
    const statuses = this.getAllJobStatuses()
    return {
      totalJobs: statuses.length,
      runningJobs: statuses.filter(s => s.status === 'running').length,
      successfulJobs: statuses.filter(s => s.status === 'success').length,
      failedJobs: statuses.filter(s => s.status === 'error').length,
      lastUpdated: new Date().toISOString(),
      jobs: statuses.reduce((acc, status) => {
        acc[status.name] = {
          status: status.status,
          lastRun: status.lastRun?.toISOString(),
          lastSuccess: status.lastSuccess?.toISOString(),
          lastError: status.lastError?.toISOString(),
          nextRun: status.nextRun?.toISOString(),
          metrics: status.metrics
        }
        return acc
      }, {} as { [key: string]: any })
    }
  }
}
