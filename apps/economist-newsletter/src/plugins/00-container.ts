import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { container } from '../services/config/inversify.config'

// Plugin to register the DI container with Fastify
const containerPlugin: FastifyPluginAsync = async (fastify) => {
  // Decorate fastify instance with the DI container
  fastify.decorate('container', container)
  
  fastify.log.info('📦 Dependency Injection container registered')
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
