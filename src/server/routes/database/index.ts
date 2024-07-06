import { FastifyInstance } from 'fastify/types/instance'
import { searchData } from '@plugin/core/database'

export default async (fastify: FastifyInstance) => {

  /**
   * GET请求
   */
  // 默认页面
  fastify.get('/', async (_request, reply) => {
    return reply.sendFile('page/database/index.html')
  })

  /**
   * POST请求
   */

  // 获取database数据
  fastify.post('/SearchData', async (request, reply) => {
    const { pattern = '*', page = 1, count = 10 } = request.body as { pattern?: string, page?: number, count?: number }
    try {
      const data = await searchData(pattern, page, count)
      return reply.send({ status: 'success', data: data })
    } catch (error: any) {
      return reply.status(400).send({ status: 'error', message: error.toString() })
    }
  })

}
