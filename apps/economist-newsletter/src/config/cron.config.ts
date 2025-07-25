// Cron schedule configurations
export const CRON_SCHEDULES = {
  // Daily newsletter at 8:00 AM
  DAILY_NEWSLETTER: '0 8 * * *',
  
  // Weekly preview on Monday at 9:00 AM
  WEEKLY_PREVIEW: '0 9 * * 1',
  
  // Weekly review on Friday at 5:00 PM
  WEEKLY_REVIEW: '0 17 * * 5',
  
  // News aggregation every 4 hours
  NEWS_AGGREGATION: '0 */4 * * *',
  
  // Cache cleanup daily at 2:00 AM
  CACHE_CLEANUP: '0 2 * * *'
} as const

// Cron job descriptions
export const CRON_DESCRIPTIONS = {
  DAILY_NEWSLETTER: 'Sends daily economic digest to subscribers',
  WEEKLY_PREVIEW: 'Sends weekly economic preview every Monday',
  WEEKLY_REVIEW: 'Sends weekly economic review every Friday',
  NEWS_AGGREGATION: 'Fetches and processes news from RSS feeds',
  CACHE_CLEANUP: 'Cleans up old cached data and metrics'
} as const

// Environment-specific configurations
export const getCronConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  
  return {
    // Disable cron jobs in test environment
    enabled: env !== 'test',
    
    // In development, use more frequent schedules for testing
    schedules: env === 'development' ? {
      // For development: run every few minutes for quick testing
      DAILY_NEWSLETTER: '*/5 * * * *',    // Every 5 minutes
      WEEKLY_PREVIEW: '*/7 * * * *',      // Every 7 minutes
      WEEKLY_REVIEW: '*/10 * * * *',      // Every 10 minutes
      NEWS_AGGREGATION: '*/3 * * * *',    // Every 3 minutes
      CACHE_CLEANUP: '*/20 * * * *'       // Every 20 minutes
    } : CRON_SCHEDULES,
    
    // Timezone configuration
    timezone: process.env.TZ || 'UTC',
    
    // Batch processing settings
    batch: {
      emailBatchSize: parseInt(process.env.EMAIL_BATCH_SIZE || '50'),
      processingDelay: parseInt(process.env.PROCESSING_DELAY || '5000'), // 5 seconds
      maxRetries: parseInt(process.env.MAX_RETRIES || '3')
    }
  }
}
