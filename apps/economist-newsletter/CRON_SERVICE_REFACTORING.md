# Cron Service Refactoring

This document describes the refactored cron job system for the Economist Newsletter app.

## Overview

The cron system has been refactored to separate concerns:
- **CronService**: Contains all business logic for job execution and status tracking
- **Cron Plugin**: Only handles job scheduling and triggering
- **Admin API**: Provides monitoring and manual trigger endpoints

## Architecture

### CronService (`src/services/domain/cron.service.ts`)

The `CronService` class encapsulates all cron job business logic:

**Key Features:**
- **Job Execution**: All job logic (daily newsletter, weekly preview, etc.)
- **Status Tracking**: Tracks job execution status, timing, and metrics
- **Error Handling**: Comprehensive error tracking and reporting
- **Metrics Collection**: Tracks performance metrics for monitoring

**Available Jobs:**
- `runDailyNewsletter()` - Fetches news, generates AI content, sends daily newsletter
- `runWeeklyPreview()` - Generates and sends weekly preview newsletter
- `runWeeklyReview()` - Generates and sends weekly review newsletter  
- `runNewsAggregation()` - Fetches and processes RSS feeds
- `runCacheCleanup()` - Cleans up old cached data (placeholder)

**Status Methods:**
- `getJobStatus(jobName)` - Get status of individual job
- `getAllJobStatuses()` - Get status of all jobs
- `getJobMetrics()` - Get comprehensive metrics
- `updateNextRunTime(jobName, nextRun)` - Update next execution time

### Cron Plugin (`src/plugins/cron.ts`)

The plugin is now simplified to only handle:
- **Scheduling**: Uses node-cron to schedule jobs
- **Triggering**: Calls appropriate CronService methods
- **Lifecycle**: Starts/stops jobs with server lifecycle
- **Admin Interface**: Exposes manual triggers and service access

### Admin API (`src/routes/admin/cron.ts`)

Enhanced admin endpoints for monitoring and control:

**Status Endpoints:**
- `GET /admin/cron/status` - Overall cron system status
- `GET /admin/cron/metrics` - Detailed metrics for all jobs
- `GET /admin/cron/status/:jobName` - Individual job status

**Manual Trigger Endpoints:**
- `POST /admin/cron/daily-newsletter` - Trigger daily newsletter
- `POST /admin/cron/weekly-preview` - Trigger weekly preview
- `POST /admin/cron/weekly-review` - Trigger weekly review
- `POST /admin/cron/news-aggregation` - Trigger news aggregation
- `POST /admin/cron/cache-cleanup` - Trigger cache cleanup
- `POST /admin/cron/trigger-all` - Trigger all jobs (testing only)

## Job Status Tracking

Each job maintains comprehensive status information:

```typescript
interface JobStatus {
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
```

## Benefits of Refactoring

1. **Separation of Concerns**: Business logic separated from scheduling
2. **Better Testing**: Service methods can be unit tested independently
3. **Enhanced Monitoring**: Comprehensive status and metrics tracking
4. **Easier Debugging**: Clear error tracking and logging
5. **Scalability**: Service can be extended without touching plugin code
6. **Maintainability**: Clear code organization and responsibilities

## Usage Example

```typescript
// Get cron service instance
const cronService = fastify.cronJobs.cronService

// Check job status
const status = cronService.getJobStatus('dailyNewsletter')
console.log(`Daily newsletter last run: ${status?.lastRun}`)

// Get all metrics
const metrics = cronService.getJobMetrics()
console.log(`Total jobs: ${metrics.totalJobs}`)

// Manually trigger a job
await cronService.runDailyNewsletter()
```

## Configuration

Cron schedules are managed in `src/config/cron.config.ts`:
- **Production**: Standard business hours schedules
- **Development**: Frequent schedules for testing
- **Test**: Disabled by default

## Future Enhancements

- Replace placeholder subscriber functions with real database queries
- Implement actual cache cleanup logic
- Add retry mechanisms for failed jobs
- Add job queue support for high-volume processing
- Add webhook notifications for job failures
