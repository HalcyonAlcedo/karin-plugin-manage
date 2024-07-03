import { GetAllPluginWidgets, GetPluginWidgets, getPluginsList } from '@plugin/core/config'

export default async (fastify:any) => {
  // 获取组件
  await fastify.post('/GetWidgets', async (request:any, reply:any) => {
    const { plugin } = request.body
    const plugins = getPluginsList()
    if (plugin && plugins.includes(plugin)) {
      return reply.send({
        status: 'success',
        data: await GetPluginWidgets(plugin)
      })
    } else {
      return reply.send({
        status: 'failed',
        data: [],
        message: '错误，插件不存在！'
      })
    }
  })
  // 获取全部组件
  await fastify.post('/GetAllWidgets', async (_request:any, reply:any) => {
    return reply.send({
      status: 'success',
      data: await GetAllPluginWidgets()
    })
  })
}
