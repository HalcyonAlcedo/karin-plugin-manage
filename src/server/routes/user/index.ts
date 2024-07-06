import { FastifyInstance } from 'fastify/types/instance'
import Auth from './auth'
import Info from './info'
import Management from './management'

export default async (fastify: FastifyInstance) => {

  /**
   * GET请求
   */

  // 默认页面
  fastify.get('/', async (_request, reply) => {
    return reply.sendFile('page/user/index.html')
  })


  /**
   * POST请求
   */
  Auth(fastify)
  Info(fastify)
  Management(fastify)
}
