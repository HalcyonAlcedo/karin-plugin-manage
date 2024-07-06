import { FastifyInstance } from 'fastify/types/instance'
import { getBotList } from '@plugin/core/system'

export default async (fastify: FastifyInstance) => {
  // 获取Bot列表
  fastify.post('/GetBotList', async (_request, reply) => {
    try {
      const botList = await getBotList()
      return reply.send({
        status: 'success',
        data: botList
      })
    } catch (error: any) {
      return reply.code(500).send({
        status: 'failed',
        meaasge: error.toString()
      })
    }
  })
}
