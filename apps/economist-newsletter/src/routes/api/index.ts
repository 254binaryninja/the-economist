import { FastifyPluginAsync } from 'fastify'

// Import API version routes
import v1Routes from './v1'

const apiRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // Register API v1 routes under /api/v1
  await fastify.register(v1Routes, { prefix: '/v1' })
  
  // Future API versions can be added here
  // await fastify.register(v2Routes, { prefix: '/api/v2' })
}

export default apiRoutes
