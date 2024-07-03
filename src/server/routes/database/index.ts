import { searchData } from '@plugin/core/database'

export default async (fastify:any, _options:any) => {

  /**
   * GET请求
   */
  // 默认页面
  await fastify.get('/', async (request:any, reply:any) => {
    return reply.sendFile('page/database/index.html')
  })

  /**
   * POST请求
   */

  // 获取database数据
  await fastify.post('/SearchData', async (request:any, reply:any) => {
    const { pattern = '*', page = 1, count = 10 } = request.body || {}
    try {
      const data = await searchData(pattern, page, count)
      return reply.send({ status: 'success', data: data })
    } catch (error:any) {
      return reply.status(400).send({ status: 'error', message: error?.message || error })
    }
  })

}
