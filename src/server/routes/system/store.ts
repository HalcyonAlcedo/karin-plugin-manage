import { FastifyInstance } from 'fastify/types/instance'
import { config } from '@plugin/imports'

export default async (fastify: FastifyInstance) => {
  // 获取Bot列表
  fastify.post('/GetStoreList', async (_request, reply) => {
    try {
      return reply.send({
        status: 'success',
        data: config.Store.storeList
      })
    } catch (error: any) {
      return reply.code(500).send({
        status: 'failed',
        meaasge: error.toString()
      })
    }
  })
}
