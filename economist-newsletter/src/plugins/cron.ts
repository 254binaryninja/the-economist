import fp from 'fastify-plugin'
import cron from 'node-cron'

export interface CronPluginOptions {
  // Specify cron plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<CronPluginOptions>(async (fastify, opts) => {
  
  // Example: Send newsletter every day at 9 AM
  const dailyNewsletterJob = cron.schedule('0 9 * * *', async () => {
    fastify.log.info('Running daily newsletter cron job...')
    
    try {
      // Add your newsletter logic here
      // Example: await sendDailyNewsletter()
      fastify.log.info('Daily newsletter sent successfully')
    } catch (error) {
      fastify.log.error('Daily newsletter cron job failed:', error)
    }
  }, {
    scheduled: false // Don't start immediately
  })

  // Example: Cleanup old data every week
  const weeklyCleanupJob = cron.schedule('0 2 * * 0', async () => {
    fastify.log.info('Running weekly cleanup cron job...')
    
    try {
      // Add your cleanup logic here
      // Example: await cleanupOldSubscribers()
      fastify.log.info('Weekly cleanup completed successfully')
    } catch (error) {
      fastify.log.error('Weekly cleanup cron job failed:', error)
    }
  }, {
    scheduled: false
  })

  // Start jobs when server is ready
  fastify.addHook('onReady', async () => {
    if (process.env.NODE_ENV !== 'test') {
      dailyNewsletterJob.start()
      weeklyCleanupJob.start()
      fastify.log.info('Cron jobs started')
    }
  })

  // Stop jobs when server is closing
  fastify.addHook('onClose', async () => {
    dailyNewsletterJob.stop()
    weeklyCleanupJob.stop()
    fastify.log.info('Cron jobs stopped')
  })

  // Decorate fastify instance with cron utilities
  fastify.decorate('cronJobs', {
    dailyNewsletter: dailyNewsletterJob,
    weeklyCleanup: weeklyCleanupJob
  })
})

// TypeScript declarations
declare module 'fastify' {
  export interface FastifyInstance {
    cronJobs: {
      dailyNewsletter: cron.ScheduledTask
      weeklyCleanup: cron.ScheduledTask
    }
  }
}
