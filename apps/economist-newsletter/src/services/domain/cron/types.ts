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

export type JobFunction = () => Promise<CronJobResult>
