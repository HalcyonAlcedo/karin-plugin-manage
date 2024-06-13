import { GetAllPluginWidgets } from '../../../config/plugin.js'

export default async (fastify) => {
  // 获取全部组件
  await fastify.post('/GetWidgets', async (request, reply) => {
    return reply.send({
      status: 'success',
      data: await GetAllPluginWidgets()
    })
  })
}
