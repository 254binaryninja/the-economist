import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return { 
      message: 'Welcome to the Economist Newsletter API',
      version: '1.0.0',
      routes: {
        subscribe: '/subscribe',
        unsubscribe: '/unsubscribe',
        status: '/status'
      }
    }
  })
}

export default root
