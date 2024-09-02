import { FastifyInstance } from 'fastify/types/instance'
import Bot from './bot'
import Karin from './karin'
import Terminal from './terminal'
import Store from './store'

export default async (fastify: FastifyInstance) => {

  /**
   * GET请求
   */
  // 默认页面
  fastify.get('/', async (_request, reply) => {
    return reply.sendFile('page/system/index.html')
  })

  /**
   * POST请求
   */
  fastify.post('/verify', async (_request, reply) => {
    reply.send({ status: 'success', message: 'verify success' })
  })

  Bot(fastify)
  Karin(fastify)
  Terminal(fastify)
  Store(fastify)
}
