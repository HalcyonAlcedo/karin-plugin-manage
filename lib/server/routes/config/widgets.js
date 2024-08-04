import { GetAllPluginWidgets, GetPluginWidgets, getPluginsList } from '../../../core/config/index.js'
export default async (fastify) => {
  // 获取组件
  fastify.post('/GetWidgets', async (request, reply) => {
    const { plugin } = request.body
    const plugins = getPluginsList()
    if (plugin && plugins.includes(plugin)) {
      return reply.send({
        status: 'success',
        data: await GetPluginWidgets(plugin),
      })
    } else {
      return reply.send({
        status: 'failed',
        data: [],
        message: '错误，插件不存在！',
      })
    }
  })
  // 获取全部组件
  fastify.post('/GetAllWidgets', async (_request, reply) => {
    return reply.send({
      status: 'success',
      data: await GetAllPluginWidgets(),
    })
  })
}
