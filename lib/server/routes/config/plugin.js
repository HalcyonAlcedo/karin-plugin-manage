import { getPluginConfig, getPluginsList, setPluginConfig, getExamplePluginsList } from '../../../core/config/index.js'
export default async (fastify) => {
  // 获取插件列表
  fastify.post('/GetPluginList', async (_request, reply) => {
    return reply.send({
      status: 'success',
      data: getPluginsList(),
    })
  })
  // 获取单插件列表
  fastify.post('/GetExamplePluginList', async (_request, reply) => {
    return reply.send({
      status: 'success',
      data: getExamplePluginsList(),
    })
  })
  // 获取插件配置
  fastify.post('/GetPluginConfig', async (request, reply) => {
    const { plugin } = request.body
    const plugins = getPluginsList()
    if (plugin && plugins.includes(plugin)) {
      const result = getPluginConfig(plugin)
      return reply.send({
        status: 'success',
        data: result.config,
        view: 'view' in result ? result.view : undefined,
        associated: 'associated' in result ? result.associated : undefined,
      })
    } else {
      return reply.send({
        status: 'failed',
        data: [],
        message: '错误，插件不存在！',
      })
    }
  })
  // 设置插件配置
  fastify.post('/SetPluginConfig', async (request, reply) => {
    const { plugin, config } = request.body
    const plugins = getPluginsList()
    if (plugin && plugins.includes(plugin)) {
      const changeConfig = []
      for (const cfg of config) {
        const change = setPluginConfig(plugin, cfg.file, cfg.key, cfg.value)
        if (change && change.value != change.change) {
          changeConfig.push(change)
        }
      }
      return reply.send({
        status: 'success',
        data: changeConfig,
      })
    } else {
      return reply.send({
        status: 'failed',
        data: [],
        message: '错误，插件不存在！',
      })
    }
  })
}
