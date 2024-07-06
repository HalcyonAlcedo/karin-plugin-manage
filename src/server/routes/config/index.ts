import { FastifyInstance } from 'fastify/types/instance'
import PluginPost from './plugin'
import KarinPost from './karin'
import WidgetsPost from './widgets'

export default async (fastify:FastifyInstance) => {
  /**
   * GET请求
   */
  // 默认页面
  fastify.get('/', async (_request, reply) => {
    return reply.sendFile('page/config/index.html')
  })


  /**
   * POST请求
   */
  PluginPost(fastify)
  KarinPost(fastify)
  WidgetsPost(fastify)
}
