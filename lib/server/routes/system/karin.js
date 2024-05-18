import { getRendererList } from '../../../system/index.js'

export default async (fastify) => {
  // 获取渲染器列表
  await fastify.post('/GetRendererCount', async (request, reply) => {
    const rendererList = await getRendererList()
    return reply.send({
      status: 'success',
      data: rendererList.size
    })
  })

}
