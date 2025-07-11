import { FastifyPluginAsync } from 'fastify'

// Import admin feature routes
import cronTaskRoutes from './jobs'
// Future admin routes can be imported here:
// import userRoutes from './users'
// import analyticsRoutes from './analytics'
// import newsletterRoutes from './newsletters'

const adminRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // Register cron management routes under /cron
  await fastify.register(cronTaskRoutes, { prefix: '/cron' })
  
  // Future admin routes:
  // await fastify.register(userRoutes, { prefix: '/users' })
  // await fastify.register(analyticsRoutes, { prefix: '/analytics' })
  // await fastify.register(newsletterRoutes, { prefix: '/newsletters' })
  
  // Admin dashboard/overview endpoint
  fastify.get('/', async (request, reply) => {
    return {
      message: 'Economist Newsletter Admin API',
      version: '1.0.0',
      endpoints: {
        cron: '/admin/cron',
        // users: '/admin/users',
        // analytics: '/admin/analytics',
        // newsletters: '/admin/newsletters'
      }
    }
  })
}

export default adminRoutes
