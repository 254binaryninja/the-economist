import cron from 'node-cron'
import { FastifyInstance } from 'fastify'

export class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map()
  private fastify: FastifyInstance

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
  }

  // Schedule a daily newsletter
  scheduleDailyNewsletter() {
    const job = cron.schedule('0 9 * * *', async () => {
      this.fastify.log.info('Running daily newsletter cron job...')
      
      try {
        // Add your newsletter logic here
        // Example: await this.sendDailyNewsletter()
        this.fastify.log.info('Daily newsletter sent successfully')
      } catch (error) {
        this.fastify.log.error('Daily newsletter cron job failed:', error)
      }
    }, {
      scheduled: false
    })

    this.jobs.set('dailyNewsletter', job)
    return job
  }

  // Schedule weekly cleanup
  scheduleWeeklyCleanup() {
    const job = cron.schedule('0 2 * * 0', async () => {
      this.fastify.log.info('Running weekly cleanup cron job...')
      
      try {
        // Add your cleanup logic here
        // Example: await this.cleanupOldData()
        this.fastify.log.info('Weekly cleanup completed successfully')
      } catch (error) {
        this.fastify.log.error('Weekly cleanup cron job failed:', error)
      }
    }, {
      scheduled: false
    })

    this.jobs.set('weeklyCleanup', job)
    return job
  }

  // Start all jobs
  startAll() {
    if (process.env.NODE_ENV !== 'test') {
      this.jobs.forEach((job, name) => {
        job.start()
        this.fastify.log.info(`Started cron job: ${name}`)
      })
    }
  }

  // Stop all jobs
  stopAll() {
    this.jobs.forEach((job, name) => {
      job.stop()
      this.fastify.log.info(`Stopped cron job: ${name}`)
    })
  }

  // Get specific job
  getJob(name: string): cron.ScheduledTask | undefined {
    return this.jobs.get(name)
  }
}
