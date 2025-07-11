import { FastifyInstance, FastifyPluginOptions } from 'fastify'

async function cronTaskRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {

  // Route to manually trigger daily news
  fastify.post('/daily-news', async (request, reply) => {
    try {
      fastify.log.info('Manual trigger: Daily news requested')

      // Call the manual trigger function
      await fastify.cronJobs.manualTriggers.triggerDailyNewsletter()
      
      return {
        success: true,
        message: 'Daily newsletter triggered successfully',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      fastify.log.error('Manual daily newsletter trigger failed:', error)
      reply.status(500)
      return {
        success: false,
        message: 'Failed to trigger daily newsletter',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // Route to manually trigger weekly preview
  fastify.post('/weekly-preview', async (request, reply) => {
    try {
      fastify.log.info('Manual trigger: Weekly preview requested')
      
      await fastify.cronJobs.manualTriggers.triggerWeeklyPreview()
      
      return {
        success: true,
        message: 'Weekly preview triggered successfully',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      fastify.log.error('Manual weekly preview trigger failed:', error)
      reply.status(500)
      return {
        success: false,
        message: 'Failed to trigger weekly preview',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // Route to manually trigger weekly review
  fastify.post('/weekly-review', async (request, reply) => {
    try {
      fastify.log.info('Manual trigger: Weekly review requested')
      
      await fastify.cronJobs.manualTriggers.triggerWeeklyReview()
      
      return {
        success: true,
        message: 'Weekly review triggered successfully',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      fastify.log.error('Manual weekly review trigger failed:', error)
      reply.status(500)
      return {
        success: false,
        message: 'Failed to trigger weekly review',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // Route to manually trigger news aggregation
  fastify.post('/news-aggregation', async (request, reply) => {
    try {
      fastify.log.info('Manual trigger: News aggregation requested')
      
      await fastify.cronJobs.manualTriggers.triggerNewsAggregation()
      
      return {
        success: true,
        message: 'News aggregation triggered successfully',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      fastify.log.error('Manual news aggregation trigger failed:', error)
      reply.status(500)
      return {
        success: false,
        message: 'Failed to trigger news aggregation',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // Route to manually trigger cache cleanup
  fastify.post('/cache-cleanup', async (request, reply) => {
    try {
      fastify.log.info('Manual trigger: Cache cleanup requested')
      
      await fastify.cronJobs.manualTriggers.triggerCacheCleanup()
      
      return {
        success: true,
        message: 'Cache cleanup triggered successfully',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      fastify.log.error('Manual cache cleanup trigger failed:', error)
      reply.status(500)
      return {
        success: false,
        message: 'Failed to trigger cache cleanup',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // Route to get cron job status
  fastify.get('/status', async (request, reply) => {
    try {
      const cronService = fastify.cronJobs.cronService
      const jobMetrics = cronService.getJobMetrics()
      
      return {
        success: true,
        message: 'Cron job status retrieved successfully',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        metrics: jobMetrics,
        // Legacy format for backward compatibility
        jobs: {
          dailyNewsletter: {
            running: cronService.getJobStatus('dailyNewsletter')?.status === 'running',
            schedule: 'Daily at 8:00 AM (production) / Every 30 min (development)',
            description: 'Sends daily economic digest',
            status: cronService.getJobStatus('dailyNewsletter')
          },
          weeklyPreview: {
            running: cronService.getJobStatus('weeklyPreview')?.status === 'running',
            schedule: 'Monday at 9:00 AM (production) / Every 35 min (development)',
            description: 'Sends weekly economic preview',
            status: cronService.getJobStatus('weeklyPreview')
          },
          weeklyReview: {
            running: cronService.getJobStatus('weeklyReview')?.status === 'running',
            schedule: 'Friday at 5:00 PM (production) / Every 40 min (development)',
            description: 'Sends weekly economic review',
            status: cronService.getJobStatus('weeklyReview')
          },
          newsAggregation: {
            running: cronService.getJobStatus('newsAggregation')?.status === 'running',
            schedule: 'Every 4 hours (production) / Every 15 min (development)',
            description: 'Aggregates and processes news',
            status: cronService.getJobStatus('newsAggregation')
          },
          cacheCleanup: {
            running: cronService.getJobStatus('cacheCleanup')?.status === 'running',
            schedule: 'Daily at 2:00 AM (production) / Every 2 hours (development)',
            description: 'Cleans up old cached data',
            status: cronService.getJobStatus('cacheCleanup')
          }
        }
      }
    } catch (error) {
      fastify.log.error('Failed to get cron job status:', error)
      reply.status(500)
      return {
        success: false,
        message: 'Failed to get cron job status',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // Route to get detailed job metrics
  fastify.get('/metrics', async (request, reply) => {
    try {
      const cronService = fastify.cronJobs.cronService
      const metrics = cronService.getJobMetrics()
      
      return {
        success: true,
        message: 'Cron job metrics retrieved successfully',
        timestamp: new Date().toISOString(),
        ...metrics
      }
    } catch (error) {
      fastify.log.error('Failed to get cron job metrics:', error)
      reply.status(500)
      return {
        success: false,
        message: 'Failed to get cron job metrics',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // Route to get individual job status
  fastify.get('/status/:jobName', async (request, reply) => {
    try {
      const { jobName } = request.params as { jobName: string }
      const cronService = fastify.cronJobs.cronService
      const jobStatus = cronService.getJobStatus(jobName)
      
      if (!jobStatus) {
        reply.status(404)
        return {
          success: false,
          message: `Job '${jobName}' not found`,
          availableJobs: ['dailyNewsletter', 'weeklyPreview', 'weeklyReview', 'newsAggregation', 'cacheCleanup']
        }
      }
      
      return {
        success: true,
        message: `Status for job '${jobName}' retrieved successfully`,
        timestamp: new Date().toISOString(),
        job: jobStatus
      }
    } catch (error) {
      fastify.log.error('Failed to get job status:', error)
      reply.status(500)
      return {
        success: false,
        message: 'Failed to get job status',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // Route to trigger all jobs for testing (use with caution)
  fastify.post('/trigger-all', async (request, reply) => {
    try {
      fastify.log.info('Manual trigger: All cron jobs requested (testing mode)')
      
      // Trigger news aggregation first
      await fastify.cronJobs.manualTriggers.triggerNewsAggregation()
      
      // Wait a bit for news to be processed
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Trigger newsletters and cleanup in parallel
      await Promise.all([
        fastify.cronJobs.manualTriggers.triggerDailyNewsletter(),
        fastify.cronJobs.manualTriggers.triggerWeeklyPreview(),
        fastify.cronJobs.manualTriggers.triggerWeeklyReview(),
        fastify.cronJobs.manualTriggers.triggerCacheCleanup()
      ])
      
      return {
        success: true,
        message: 'All cron jobs triggered successfully',
        timestamp: new Date().toISOString(),
        warning: 'This endpoint is for testing only. Use individual triggers in production.',
        jobsTriggered: ['newsAggregation', 'dailyNewsletter', 'weeklyPreview', 'weeklyReview', 'cacheCleanup']
      }
    } catch (error) {
      fastify.log.error('Manual trigger all failed:', error)
      reply.status(500)
      return {
        success: false,
        message: 'Failed to trigger all cron jobs',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })
}

export default cronTaskRoutes
