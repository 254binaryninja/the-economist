import { FastifyInstance } from 'fastify'
import type { JobStatus, JobFunction } from './types'

export class BaseCronService {
  protected fastify: FastifyInstance
  protected jobStatuses: Map<string, JobStatus> = new Map()

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify
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

  protected updateJobStatus(jobName: string, updates: Partial<JobStatus>) {
    const current = this.jobStatuses.get(jobName) || { name: jobName, status: 'scheduled' }
    this.jobStatuses.set(jobName, { ...current, ...updates })
  }

  protected async executeJob(jobName: string, jobFunction: JobFunction): Promise<void> {
    const startTime = Date.now()
    this.updateJobStatus(jobName, { status: 'running' })
    
    this.fastify.log.info(`🚀 Starting job: ${jobName}`)

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
        this.fastify.log.info(`✅ Job ${jobName} completed successfully in ${duration}ms`, {
          jobName,
          duration,
          metrics: result.metrics
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
        this.fastify.log.error(`❌ Job ${jobName} failed after ${duration}ms`, {
          jobName,
          duration,
          error: result.error,
          metrics: result.metrics
        })
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      
      this.updateJobStatus(jobName, {
        status: 'error',
        lastRun: new Date(),
        lastError: new Date(),
        errorMessage,
        metrics: { duration }
      })
      
      this.fastify.log.error(`💥 Job ${jobName} crashed after ${duration}ms`, {
        jobName,
        duration,
        error: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      })
      
      // Don't re-throw the error, just log it and mark the job as failed
      // This prevents the cron scheduler from stopping
    }
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
