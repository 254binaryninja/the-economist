# Modular Cron Service

This directory contains the refactored cron service, broken down into multiple focused files for better maintainability and debugging.

## File Structure

- **`index.ts`** - Main export file that re-exports all modules
- **`types.ts`** - TypeScript interfaces and types used across the cron system
- **`utils.ts`** - Utility functions for service validation, subscriber fetching, and development mode checks
- **`base.service.ts`** - Base CronService class with core functionality (job execution, status management, monitoring)
- **`cron.service.ts`** - Main CronService class that extends the base and orchestrates all jobs

## Job Files

Each cron job has its own dedicated file for easier debugging and maintenance:

- **`daily-newsletter.job.ts`** - Daily newsletter generation and sending
- **`weekly-preview.job.ts`** - Weekly preview newsletter with enhanced error handling
- **`weekly-review.job.ts`** - Weekly review newsletter
- **`news-aggregation.job.ts`** - News fetching, processing, and storage
- **`cache-cleanup.job.ts`** - Database cleanup operations

## Benefits of This Structure

1. **Easier Debugging** - Each job is isolated, making it easier to debug specific functionality
2. **Maintainability** - Changes to one job don't affect others
3. **Testing** - Individual job functions can be unit tested more easily
4. **Code Reuse** - Utility functions are shared across all jobs
5. **Separation of Concerns** - Core functionality is separated from job-specific logic

## Usage

The refactored service maintains the same external API. Import it as before:

```typescript
import { CronService } from '../services/domain/cron.service'
```

Or import specific parts for testing:

```typescript
import { runDailyNewsletterJob, validateServices } from '../services/domain/cron'
```

## Development Features

- Enhanced error logging with step-by-step debugging
- Development mode optimizations (limited news items, limited email recipients)
- Service validation helpers
- Granular error handling for each job step
