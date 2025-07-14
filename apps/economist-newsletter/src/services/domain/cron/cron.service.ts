import { FastifyInstance } from 'fastify'
import { BaseCronService } from './base.service'
import { runDailyNewsletterJob } from './daily-newsletter.job'
import { runWeeklyPreviewJob } from './weekly-preview.job'
import { runWeeklyReviewJob } from './weekly-review.job'
import { runNewsAggregationJob } from './news-aggregation.job'
import { runCacheCleanupJob } from './cache-cleanup.job'

export class CronService extends BaseCronService {
  constructor(fastify: FastifyInstance) {
    super(fastify)
  }

  // Daily Newsletter Job
  async runDailyNewsletter(): Promise<void> {
    await this.executeJob('dailyNewsletter', () => runDailyNewsletterJob(this.fastify))
  }

  // Weekly Preview Job
  async runWeeklyPreview(): Promise<void> {
    await this.executeJob('weeklyPreview', () => runWeeklyPreviewJob(this.fastify))
  }

  // Weekly Review Job
  async runWeeklyReview(): Promise<void> {
    await this.executeJob('weeklyReview', () => runWeeklyReviewJob(this.fastify))
  }

  // News Aggregation Job
  async runNewsAggregation(): Promise<void> {
    await this.executeJob('newsAggregation', () => runNewsAggregationJob(this.fastify))
  }

  // Cache Cleanup Job
  async runCacheCleanup(): Promise<void> {
    await this.executeJob('cacheCleanup', () => runCacheCleanupJob(this.fastify))
  }
}
