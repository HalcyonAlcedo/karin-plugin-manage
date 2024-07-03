import Bot from './bot'
import Karin from './karin'
import Terminal from './terminal'

export default async (fastify: any, _options: any) => {

  /**
   * GET请求
   */
  // 默认页面
  await fastify.get('/', async (_request: any, reply: any) => {
    return reply.sendFile('page/system/index.html')
  })

  /**
   * POST请求
   */
  await fastify.post('/verify', async (_request: any, reply: any) => {
    reply.send({ status: 'success', message: 'verify success' })
  })

  Bot(fastify)
  Karin(fastify)
  Terminal(fastify)
}
