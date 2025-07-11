# Newsletter Cron Jobs

> **📋 REFACTORING UPDATE**: The cron system has been refactored for better maintainability and monitoring. See [CRON_SERVICE_REFACTORING.md](./CRON_SERVICE_REFACTORING.md) for details on the new architecture.

## Overview

The system includes 5 main cron jobs that work together to:
1. Aggregate and process news from RSS feeds
2. Generate AI-powered newsletter content
3. Send daily and weekly newsletters to subscribers
4. Clean up old cached data

**New Architecture (Post-Refactoring):**
- **CronService**: Contains all business logic and status tracking
- **Cron Plugin**: Handles only scheduling and triggering
- **Admin API**: Provides monitoring and manual control endpoints

## Cron Jobs

### 1. Daily Newsletter Job
- **Schedule**: Daily at 8:00 AM (production) / Every 30 minutes (development)
- **Purpose**: Sends daily economic digest to subscribers
- **Process**:
  1. Fetches fresh RSS feeds
  2. Filters for economic news
  3. Deduplicates and categorizes articles
  4. Stores processed news in Redis
  5. Generates daily newsletter content using AI
  6. Sends emails to daily newsletter subscribers

### 2. Weekly Preview Job
- **Schedule**: Monday at 9:00 AM (production) / Every 35 minutes (development)
- **Purpose**: Sends weekly economic preview newsletter
- **Process**:
  1. Retrieves cached news from the past 7 days
  2. Generates weekly preview content using AI
  3. Sends emails to all newsletter subscribers

### 3. Weekly Review Job
- **Schedule**: Friday at 5:00 PM (production) / Every 40 minutes (development)
- **Purpose**: Sends weekly economic review newsletter
- **Process**:
  1. Retrieves cached news from Monday to Friday
  2. Generates weekly review content using AI
  3. Sends emails to all newsletter subscribers

### 4. News Aggregation Job
- **Schedule**: Every 4 hours (production) / Every 15 minutes (development)
- **Purpose**: Keeps news cache fresh throughout the day
- **Process**:
  1. Fetches fresh RSS feeds
  2. Processes and stores news items
  3. Updates Redis cache

### 5. Cache Cleanup Job
- **Schedule**: Daily at 2:00 AM (production) / Every 2 hours (development)
- **Purpose**: Removes old cached data
- **Process**: TODO - Implementation pending

## Configuration

### Environment Variables
```bash
NODE_ENV=production          # Determines schedule frequency
TZ=UTC                      # Timezone for cron jobs
EMAIL_BATCH_SIZE=50         # Email batch size for rate limiting
PROCESSING_DELAY=5000       # Delay between processing steps (ms)
MAX_RETRIES=3              # Maximum retry attempts
```

### Development vs Production Schedules

| Job | Production | Development |
|-----|------------|-------------|
| Daily Newsletter | Daily 8:00 AM | Every 30 min |
| Weekly Preview | Monday 9:00 AM | Every 35 min |
| Weekly Review | Friday 5:00 PM | Every 40 min |
| News Aggregation | Every 4 hours | Every 15 min |
| Cache Cleanup | Daily 2:00 AM | Every 2 hours |

## Manual Triggers

For testing and debugging, you can manually trigger jobs via API endpoints:

### API Endpoints

```bash
# Trigger daily newsletter
POST /admin/cron/daily-newsletter

# Trigger weekly preview
POST /admin/cron/weekly-preview

# Trigger weekly review
POST /admin/cron/weekly-review

# Trigger news aggregation
POST /admin/cron/news-aggregation

# Get cron job status
GET /admin/cron/status

# Trigger all jobs (testing only)
POST /admin/cron/trigger-all
```

### Example Usage

```bash
# Check status
curl http://localhost:3000/admin/cron/status

# Trigger daily newsletter
curl -X POST http://localhost:3000/admin/cron/daily-newsletter

# Trigger news aggregation
curl -X POST http://localhost:3000/admin/cron/news-aggregation
```

## Database Integration

Currently using placeholder functions for subscriber data:

### Placeholder Functions
- `getSubscribers()`: Returns all newsletter subscribers
- `getDailySubscribers()`: Returns daily newsletter subscribers

### TODO: Implement Database Queries
```typescript
// Replace placeholders with actual database queries
async function getSubscribers(): Promise<string[]> {
  // Query database for active subscribers
  // Filter by subscription preferences
  // Return email addresses
}

async function getDailySubscribers(): Promise<string[]> {
  // Query database for users with daily newsletter enabled
  // Return email addresses
}
```

## Logging

All cron jobs provide detailed logging:
- Job start/completion with timestamps
- Processing statistics (items processed, emails sent)
- Error handling with detailed error messages
- Performance metrics

### Log Examples
```
🌅 Starting daily newsletter cron job...
📰 Fetching RSS feeds...
🔍 Processing 245 news items...
📊 Processed news: 245 → 156 → 98 → 87
🤖 Generating daily newsletter content with AI...
📧 Sending daily newsletter to 1,234 subscribers...
✅ Daily newsletter completed: 1,234 sent, 0 failed
```

## Error Handling

- All jobs include comprehensive error handling
- Failed operations are logged with detailed error messages
- Jobs continue running even if individual executions fail
- Manual triggers provide success/error responses

## Monitoring

Use the status endpoint to monitor job health:
```bash
curl http://localhost:3000/admin/cron/status
```

Response includes:
- Job running status
- Schedule information
- Environment configuration
- Job descriptions

## Dependencies

The cron system requires:
- **NewsAggregationService**: For fetching and processing news
- **AIContentService**: For generating newsletter content
- **EmailService**: For sending newsletters
- **Redis**: For caching news and content
- **DI Container**: For service injection

## Development Setup

1. Ensure all services are properly configured in the DI container
2. Set up Redis for caching
3. Configure email service (Brevo) credentials
4. Set up AI service (Google AI) credentials
5. Start the Fastify server

The cron jobs will automatically start when the server is ready (except in test environment).
