import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return { 
      message: 'Welcome to the Economist Newsletter API',
      version: '1.0.0',
      api: {
        version: 'v1',
        baseUrl: '/api/v1',
        endpoints: {
          public: {
            news: '/api/v1/news',
            subscriber: '/api/v1/subscriber'
          },
          admin: {
            cron: '/api/v1/admin/cron'
          }
        }
      },
      documentation: {
        swagger: '/documentation',
        health: '/health'
      }
    }
  })
}

export default root