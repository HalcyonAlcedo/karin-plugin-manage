import { searchData } from '../../../database/index.js'

export default async (fastify, options) => {

  /**
   * GET请求
   */

  /**
   * POST请求
   */

  // 获取redis数据
  await fastify.post('/SearchData', async (request, reply) => {
    const { pattern = '*', page = 1, count = 10 } = request.body || {}
    try {
      const data = await searchData(pattern, page, count)
      return reply.send({ status: 'success', data: data })
    } catch (error) {
      return reply.status(400).send({ status: 'error', message: error.message })
    }
  })

}
