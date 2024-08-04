import { getBotList } from '../../../core/system/index.js'
export default async (fastify) => {
  // 获取Bot列表
  fastify.post('/GetBotList', async (_request, reply) => {
    try {
      const botList = await getBotList()
      return reply.send({
        status: 'success',
        data: botList,
      })
    } catch (error) {
      return reply.code(500).send({
        status: 'failed',
        meaasge: error.toString(),
      })
    }
  })
}
