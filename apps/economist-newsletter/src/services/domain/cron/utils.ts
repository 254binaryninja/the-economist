import { FastifyInstance } from 'fastify'
import { TYPES } from '../../config/types'
import type { IStorageService } from '../../repository/interfaces'

/**
 * Helper function to validate that all required DI container services are available
 */
export function validateServices(fastify: FastifyInstance): void {
  const requiredServices = [
    { type: TYPES.NewsAggregationService, name: 'NewsAggregationService' },
    { type: TYPES.AIContentService, name: 'AIContentService' },
    { type: TYPES.EmailService, name: 'EmailService' },
    { type: TYPES.StorageService, name: 'StorageService' }
  ]

  for (const service of requiredServices) {
    try {
      if (!fastify.container.isBound(service.type)) {
        throw new Error(`${service.name} is not bound in DI container`)
      }
      fastify.log.debug(`✅ ${service.name} is properly bound`)
    } catch (error) {
      fastify.log.error(`❌ Service validation failed for ${service.name}:`, {
        error: error instanceof Error ? error.message : String(error),
        serviceType: service.type.toString()
      })
      throw error
    }
  }
}

/**
 * Helper function to get subscribers from database using storage service
 */
export async function getSubscribers(fastify: FastifyInstance): Promise<string[]> {
  fastify.log.info('Fetching subscribers from database...')
  try {
    const storageService = fastify.container.get<IStorageService>(TYPES.StorageService)
    const subscribers = await storageService.getConfirmedSubscribers()
    return subscribers.map(sub => sub.email)
  } catch (error) {
    fastify.log.error('Failed to fetch subscribers:', error)
    // Fallback to placeholder emails for testing
    return [
      'test1@example.com',
      'test2@example.com',
      'admin@the-economist.app'
    ]
  }
}

/**
 * Helper function to get daily newsletter subscribers from database using storage service
 */
export async function getDailySubscribers(fastify: FastifyInstance): Promise<string[]> {
  fastify.log.info('Fetching daily newsletter subscribers from database...')
  try {
    const storageService = fastify.container.get<IStorageService>(TYPES.StorageService)
    const subscribers = await storageService.getConfirmedSubscribers()
    // For now, return all confirmed subscribers for daily newsletters
    return subscribers.map(sub => sub.email)
  } catch (error) {
    fastify.log.error('Failed to fetch daily newsletter subscribers:', error)
    // Fallback to placeholder emails for testing
    return [
      'test1@example.com',
      'test2@example.com',
      'admin@the-economist.app'
    ]
  }
}

/**
 * Check if running in development mode
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development'
}
