import { FastifyInstance } from 'fastify'
import { TYPES } from '../../config/types'
import type { IStorageService } from '../../repository/interfaces'
import type { CronJobResult } from './types'

export async function runCacheCleanupJob(fastify: FastifyInstance): Promise<CronJobResult> {
  fastify.log.info('🧹 Starting cache cleanup cron job...')
  
  try {
    fastify.log.debug('🔍 Checking StorageService availability...')
    
    if (!fastify.container.isBound(TYPES.StorageService)) {
      throw new Error('StorageService is not bound in DI container')
    }
    
    fastify.log.debug('📦 Getting StorageService from container...')
    const storageService = fastify.container.get<IStorageService>(TYPES.StorageService)
    
    // Clean up old articles (older than 30 days)
    fastify.log.info('🗑️ Cleaning up old articles...')
    const deletedCount = await storageService.cleanupOldData(30)
    
    fastify.log.info(`✅ Cache cleanup completed: ${deletedCount} old articles removed`)

    return {
      success: true,
      duration: 0,
      metrics: {
        itemsProcessed: deletedCount
      }
    }

  } catch (error) {
    fastify.log.error('❌ Cache cleanup cron job failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : 'Unknown'
    })
    return {
      success: false,
      duration: 0,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
