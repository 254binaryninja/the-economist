import { FastifyPluginAsync } from 'fastify'

// Import admin and public route groups
import adminRoutes from './admin/index'
import publicRoutes from './public/index'

const v1Routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // Register admin routes under /admin
  await fastify.register(adminRoutes, { prefix: '/admin' })
  
  // Register public routes (no prefix for public API)
  await fastify.register(publicRoutes)
}

export default v1Routes
