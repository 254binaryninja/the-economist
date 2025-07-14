import { FastifyPluginAsync } from 'fastify'

// Import public feature routes
import newsRoutes from './news'
import subscriberRoutes from './subscriber'
// Future public routes can be imported here:
// import healthRoutes from './health'
// import webhookRoutes from './webhooks'

const publicRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // Register news routes under /news
  await fastify.register(newsRoutes, { prefix: '/news' })
  
  // Register subscriber routes under /subscriber
  await fastify.register(subscriberRoutes, { prefix: '/email' })
  
  // Future public routes:
  // await fastify.register(healthRoutes, { prefix: '/health' })
  // await fastify.register(webhookRoutes, { prefix: '/webhooks' })
  
  // Public API overview endpoint
  fastify.get('/', async (request, reply) => {
    return {
      message: 'Economist Newsletter Public API',
      version: '1.0.0',
      endpoints: {
        news: '/api/v1/news',
        subscriber: '/api/v1/email',
        // health: '/api/v1/health',
        // webhooks: '/api/v1/webhooks'
      }
    }
  })
}

export default publicRoutes
