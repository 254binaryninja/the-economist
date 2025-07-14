import fp from 'fastify-plugin'
import cron from 'node-cron'
import { CronService } from '../services/domain/cron.service'
import { getCronConfig } from '../config/cron.config'

export interface CronPluginOptions {
  // Specify cron plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<CronPluginOptions>(async (fastify, opts) => {
  
  // Get cron configuration
  const cronConfig = getCronConfig()

  fastify.log.info('🕐 Initializing cron jobs with configuration:', {
    environment: process.env.NODE_ENV,
    enabled: cronConfig.enabled,
    timezone: cronConfig.timezone,
    schedules: cronConfig.schedules
  })

  if (process.env.NODE_ENV === 'development') {
    fastify.log.info('⚡ Development mode: Using frequent schedules for testing:', {
      dailyNewsletter: cronConfig.schedules.DAILY_NEWSLETTER,
      weeklyPreview: cronConfig.schedules.WEEKLY_PREVIEW,
      weeklyReview: cronConfig.schedules.WEEKLY_REVIEW,
      newsAggregation: cronConfig.schedules.NEWS_AGGREGATION,
      cacheCleanup: cronConfig.schedules.CACHE_CLEANUP
    })
  }

  // Ensure container is available (should be registered by container plugin)
  if (!fastify.container) {
    throw new Error('DI Container is required for cron plugin. Make sure container plugin is loaded first.')
  }

  // Initialize the CronService
  const cronService = new CronService(fastify)

  // Create wrapper functions that update next run times and call the service
  const createJobWrapper = (jobName: string, serviceMethod: () => Promise<void>) => {
    return async () => {
      try {
        await serviceMethod.call(cronService)
      } catch (error) {
        fastify.log.error(`Cron job ${jobName} failed:`, error)
      }
    }
  }

  // Daily Newsletter Job 
  const dailyNewsletterJob = cron.schedule(
    cronConfig.schedules.DAILY_NEWSLETTER, 
    createJobWrapper('dailyNewsletter', cronService.runDailyNewsletter),
    {
      scheduled: false,
      timezone: cronConfig.timezone
    }
  )

  // Weekly Newsletter Preview Job
  const weeklyPreviewJob = cron.schedule(
    cronConfig.schedules.WEEKLY_PREVIEW, 
    createJobWrapper('weeklyPreview', cronService.runWeeklyPreview),
    {
      scheduled: false,
      timezone: cronConfig.timezone
    }
  )

  // Weekly Newsletter Review Job
  const weeklyReviewJob = cron.schedule(
    cronConfig.schedules.WEEKLY_REVIEW, 
    createJobWrapper('weeklyReview', cronService.runWeeklyReview),
    {
      scheduled: false,
      timezone: cronConfig.timezone
    }
  )

  // News Aggregation Job
  const newsAggregationJob = cron.schedule(
    cronConfig.schedules.NEWS_AGGREGATION, 
    createJobWrapper('newsAggregation', cronService.runNewsAggregation),
    {
      scheduled: false,
      timezone: cronConfig.timezone
    }
  )

  // Cache Cleanup Job
  const cacheCleanupJob = cron.schedule(
    cronConfig.schedules.CACHE_CLEANUP, 
    createJobWrapper('cacheCleanup', cronService.runCacheCleanup),
    {
      scheduled: false,
      timezone: cronConfig.timezone
    }
  )

  // Function to update next run times for status tracking
  const updateNextRunTimes = () => {
    const jobs = [
      { name: 'dailyNewsletter', schedule: cronConfig.schedules.DAILY_NEWSLETTER },
      { name: 'weeklyPreview', schedule: cronConfig.schedules.WEEKLY_PREVIEW },
      { name: 'weeklyReview', schedule: cronConfig.schedules.WEEKLY_REVIEW },
      { name: 'newsAggregation', schedule: cronConfig.schedules.NEWS_AGGREGATION },
      { name: 'cacheCleanup', schedule: cronConfig.schedules.CACHE_CLEANUP }
    ]

    jobs.forEach(({ name, schedule }) => {
      try {
        // Parse cron expression to estimate next run
        // This is a simplified approach - in production you might want to use a library like cron-parser
        const now = new Date()
        let nextRun = new Date(now.getTime() + (60 * 60 * 1000)) // Default to 1 hour from now
        
        // Basic parsing for common patterns
        if (schedule.includes('*/')) {
          // Handle minute-based intervals like */15 * * * *
          const minutes = parseInt(schedule.split('*/')[1].split(' ')[0])
          nextRun = new Date(now.getTime() + (minutes * 60 * 1000))
        } else if (schedule.startsWith('0 ')) {
          // Handle hourly/daily patterns like "0 8 * * *" (daily at 8 AM)
          nextRun = new Date(now)
          nextRun.setDate(nextRun.getDate() + 1) // Next day
        }
        
        cronService.updateNextRunTime(name, nextRun)
      } catch (error) {
        fastify.log.warn(`Could not determine next run time for ${name}:`, error)
      }
    })
  }

  // Manual trigger functions for admin API
  const manualTriggers = {
    triggerDailyNewsletter: () => cronService.runDailyNewsletter(),
    triggerWeeklyPreview: () => cronService.runWeeklyPreview(),
    triggerWeeklyReview: () => cronService.runWeeklyReview(),
    triggerNewsAggregation: () => cronService.runNewsAggregation(),
    triggerCacheCleanup: () => cronService.runCacheCleanup()
  }

  // Start jobs when server is ready
  fastify.addHook('onReady', async () => {
    if (cronConfig.enabled) {
      dailyNewsletterJob.start()
      weeklyPreviewJob.start()
      weeklyReviewJob.start()
      newsAggregationJob.start()
      cacheCleanupJob.start()
      
      // Update next run times for status tracking
      updateNextRunTimes()
      
      fastify.log.info('🚀 All cron jobs started successfully')
    } else {
      fastify.log.info('⏸️ Cron jobs disabled (test environment)')
    }
  })

  // Stop jobs when server is closing
  fastify.addHook('onClose', async () => {
    dailyNewsletterJob.stop()
    weeklyPreviewJob.stop()
    weeklyReviewJob.stop()
    newsAggregationJob.stop()
    cacheCleanupJob.stop()
    fastify.log.info('🛑 All cron jobs stopped')
  })

  // Decorate fastify instance with cron utilities
  fastify.decorate('cronJobs', {
    dailyNewsletter: dailyNewsletterJob,
    weeklyPreview: weeklyPreviewJob,
    weeklyReview: weeklyReviewJob,
    newsAggregation: newsAggregationJob,
    cacheCleanup: cacheCleanupJob,
    manualTriggers,
    cronService // Expose the service for admin monitoring
  })
}, {
  name: 'cron-plugin',
  dependencies: ['container-plugin']
})

// TypeScript declarations
declare module 'fastify' {
  export interface FastifyInstance {
    cronJobs: {
      dailyNewsletter: cron.ScheduledTask
      weeklyPreview: cron.ScheduledTask
      weeklyReview: cron.ScheduledTask
      newsAggregation: cron.ScheduledTask
      cacheCleanup: cron.ScheduledTask
      manualTriggers: {
        triggerDailyNewsletter: () => Promise<void>
        triggerWeeklyPreview: () => Promise<void>
        triggerWeeklyReview: () => Promise<void>
        triggerNewsAggregation: () => Promise<void>
        triggerCacheCleanup: () => Promise<void>
      }
      cronService: CronService
    }
  }
}
