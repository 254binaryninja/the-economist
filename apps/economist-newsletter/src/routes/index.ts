import { FastifyPluginAsync } from 'fastify'

// Import route groups
import apiRoutes from './api/index'
import rootRoutes from './root'

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // Register root route (/)
  await fastify.register(rootRoutes)
  
  // Register API routes under /api
  await fastify.register(apiRoutes, { prefix: '/api' })
}

export default routes