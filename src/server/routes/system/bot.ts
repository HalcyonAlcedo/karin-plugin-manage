import { getBotList } from '@plugin/core/system'

export default async (fastify:any) => {
  // 获取Bot列表
  await fastify.post('/GetBotList', async (_request:any, reply:any) => {
    const botList = await getBotList()
    return reply.send({
      status: 'success',
      data: botList
    })
  })
}
