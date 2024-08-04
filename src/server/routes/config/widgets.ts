import { FastifyInstance } from 'fastify/types/instance'
import { GetAllPluginWidgets, GetPluginWidgets, getPluginsList } from '@plugin/core/config'
import { dirName } from 'node-karin'

export default async (fastify: FastifyInstance) => {
  // 获取组件
  fastify.post('/GetWidgets', async (request, reply) => {
    const { plugin } = request.body as { plugin: dirName }
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
