import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { container, TYPES } from '../services/config/inversify.config'

// Plugin to register the DI container with Fastify
const containerPlugin: FastifyPluginAsync = async (fastify) => {
  // Decorate fastify instance with the DI container
  fastify.decorate('container', container)
  
  // Debug: Log what services are bound in the container
  const serviceBindings = {
    hasConfigService: container.isBound(TYPES.ConfigService),
    hasEmailService: container.isBound(TYPES.EmailService),
    hasEmailProviderService: container.isBound(TYPES.EmailProviderService),
    hasNewsletterEmailService: container.isBound(TYPES.NewsletterEmailService),
    hasSubscriptionEmailService: container.isBound(TYPES.SubscriptionEmailService),
    hasSubscriberManagementService: container.isBound(TYPES.SubscriberManagementService),
    hasRedisService: container.isBound(TYPES.RedisService),
    hasNewsAggregationService: container.isBound(TYPES.NewsAggregationService),
    hasAIContentService: container.isBound(TYPES.AIContentService),
    hasSupabaseService: container.isBound(TYPES.SupabaseService),
    hasStorageService: container.isBound(TYPES.StorageService),
    hasArticleStorageService: container.isBound(TYPES.ArticleStorageService),
    hasNewsletterStorageService: container.isBound(TYPES.NewsletterStorageService),
    hasDailyNewsStorageService: container.isBound(TYPES.DailyNewsStorageService)
  }
  
  fastify.log.info('📦 Dependency Injection container registered')
  fastify.log.info('🔍 Service binding status:', JSON.stringify(serviceBindings, null, 2))
  
  // Log each service binding separately for clarity
  Object.entries(serviceBindings).forEach(([serviceName, isBound]) => {
    fastify.log.info(`📋 ${serviceName}: ${isBound ? '✅ BOUND' : '❌ NOT BOUND'}`)
  })
  
  // // Test instantiating key services to see if there are dependency issues
  // const servicesToTest = [
  //   { type: TYPES.ConfigService, name: 'ConfigService' },
  //   { type: TYPES.SupabaseService, name: 'SupabaseService' },
  //   { type: TYPES.StorageService, name: 'StorageService' },
  //   { type: TYPES.EmailService, name: 'EmailService' },
  //   { type: TYPES.NewsAggregationService, name: 'NewsAggregationService' },
  //   { type: TYPES.AIContentService, name: 'AIContentService' }
  // ]
  
  // for (const service of servicesToTest) {
  //   try {
  //     const _instance = container.get(service.type)
  //     fastify.log.info(`✅ ${service.name} test instantiation successful`)
  //   } catch (error) {
  //     fastify.log.error(`❌ ${service.name} test instantiation failed:`)
  //     fastify.log.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`)
  //     if (error instanceof Error && error.stack) {
  //       fastify.log.error(`   Stack trace: ${error.stack}`)
  //     }
  //     if (error instanceof Error && 'cause' in error && error.cause) {
  //       fastify.log.error(`   Caused by: ${error.cause}`)
  //     }
  //   }
  // }
}

export default fp(containerPlugin, {
  name: 'container-plugin'
})

// TypeScript declarations
declare module 'fastify' {
  export interface FastifyInstance {
    container: typeof container
  }
}
