// import { describe, it, beforeEach, afterEach, expect } from '@jest/globals'
// import Fastify, { FastifyInstance } from 'fastify'
// import { Container } from 'inversify'
// import { CronService } from '../../src/services/domain/cron.service'
// import { TYPES } from '../../src/services/config/types'

// // Mock services for testing
// const mockNewsService = {
//   fetchRssFeeds: jest.fn().mockResolvedValue([]),
//   filterEconomicNews: jest.fn().mockResolvedValue([]),
//   deduplicateNews: jest.fn().mockResolvedValue([]),
//   categorizeNews: jest.fn().mockResolvedValue([]),
//   storeNews: jest.fn().mockResolvedValue(undefined),
//   getCachedNews: jest.fn().mockResolvedValue([])
// }

// const mockAIService = {
//   generateDailyNewsContent: jest.fn().mockResolvedValue('Daily content'),
//   generateNewsletterContent: jest.fn().mockResolvedValue('Newsletter content')
// }

// const mockEmailService = {
//   sendDailyNewsletter: jest.fn().mockResolvedValue({ sent: 3, failed: 0 }),
//   sendNewsletter: jest.fn().mockResolvedValue({ sent: 3, failed: 0 })
// }

// describe('CronService', () => {
//   let fastify: FastifyInstance
//   let container: Container
//   let cronService: CronService

//   beforeEach(async () => {
//     fastify = Fastify({ logger: false })
    
//     // Setup DI container with mocks
//     container = new Container()
//     container.bind(TYPES.NewsAggregationService).toConstantValue(mockNewsService)
//     container.bind(TYPES.AIContentService).toConstantValue(mockAIService)
//     container.bind(TYPES.EmailService).toConstantValue(mockEmailService)
    
//     cronService = new CronService(fastify, container)
//   })

//   afterEach(async () => {
//     await fastify.close()
//   })

//   describe('Job Status Tracking', () => {
//     it('should initialize job statuses', () => {
//       const statuses = cronService.getAllJobStatuses()
//       expect(statuses).toHaveLength(5)
      
//       const jobNames = statuses.map(s => s.name)
//       expect(jobNames).toContain('dailyNewsletter')
//       expect(jobNames).toContain('weeklyPreview')
//       expect(jobNames).toContain('weeklyReview')
//       expect(jobNames).toContain('newsAggregation')
//       expect(jobNames).toContain('cacheCleanup')
//     })

//     it('should get individual job status', () => {
//       const status = cronService.getJobStatus('dailyNewsletter')
//       expect(status).toBeDefined()
//       expect(status?.name).toBe('dailyNewsletter')
//       expect(status?.status).toBe('scheduled')
//     })

//     it('should update next run time', () => {
//       const nextRun = new Date(Date.now() + 60000) // 1 minute from now
//       cronService.updateNextRunTime('dailyNewsletter', nextRun)
      
//       const status = cronService.getJobStatus('dailyNewsletter')
//       expect(status?.nextRun).toEqual(nextRun)
//     })

//     it('should return job metrics', () => {
//       const metrics = cronService.getJobMetrics()
//       expect(metrics.totalJobs).toBe(5)
//       expect(metrics.runningJobs).toBe(0)
//       expect(metrics.jobs).toBeDefined()
//       expect(metrics.jobs.dailyNewsletter).toBeDefined()
//     })
//   })

//   describe('Daily Newsletter Job', () => {
//     it('should execute daily newsletter successfully', async () => {
//       await cronService.runDailyNewsletter()
      
//       const status = cronService.getJobStatus('dailyNewsletter')
//       expect(status?.status).toBe('success')
//       expect(status?.lastRun).toBeDefined()
//       expect(status?.lastSuccess).toBeDefined()
//       expect(status?.metrics?.emailsSent).toBe(3)
//     })

//     it('should handle daily newsletter with no news', async () => {
//       mockNewsService.fetchRssFeeds.mockResolvedValueOnce([])
      
//       await cronService.runDailyNewsletter()
      
//       const status = cronService.getJobStatus('dailyNewsletter')
//       expect(status?.status).toBe('success')
//       expect(status?.metrics?.itemsProcessed).toBe(0)
//       expect(status?.metrics?.emailsSent).toBe(0)
//     })
//   })

//   describe('News Aggregation Job', () => {
//     it('should execute news aggregation successfully', async () => {
//       const mockNews = [{ id: 1, title: 'Test News' }]
//       mockNewsService.fetchRssFeeds.mockResolvedValueOnce(mockNews)
//       mockNewsService.filterEconomicNews.mockResolvedValueOnce(mockNews)
//       mockNewsService.deduplicateNews.mockResolvedValueOnce(mockNews)
//       mockNewsService.categorizeNews.mockResolvedValueOnce(mockNews)
      
//       await cronService.runNewsAggregation()
      
//       const status = cronService.getJobStatus('newsAggregation')
//       expect(status?.status).toBe('success')
//       expect(status?.metrics?.itemsProcessed).toBe(1)
//     })
//   })

//   describe('Error Handling', () => {
//     it('should handle job errors gracefully', async () => {
//       mockNewsService.fetchRssFeeds.mockRejectedValueOnce(new Error('Network error'))
      
//       await cronService.runNewsAggregation()
      
//       const status = cronService.getJobStatus('newsAggregation')
//       expect(status?.status).toBe('error')
//       expect(status?.lastError).toBeDefined()
//       expect(status?.errorMessage).toBe('Network error')
//     })
//   })
// })
