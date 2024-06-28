import { getPluginConfig, getAllPluginConfig, getPluginsList, setPluginConfig, getExamplePluginsList } from '../../../config/plugin.js'
export default async (fastify) => {
  // 获取插件列表
  await fastify.post('/GetPluginList', async (request, reply) => {
    return reply.send({
      status: 'success',
      data: getPluginsList()
    })
  })

  // 获取单插件列表
  await fastify.post('/GetExamplePluginList', async (request, reply) => {
    return reply.send({
      status: 'success',
      data: getExamplePluginsList()
    })
  })

  // 获取全部插件配置 NOCOMMIT:不应当允许直接获取全部配置，这里作为开发时调试使用
  await fastify.post('/GetAllPluginConfig', async (request, reply) => {
    let config = getAllPluginConfig()
    return reply.send({
      status: 'success',
      data: config
    })
  })

  // 获取插件配置
  await fastify.post('/GetPluginConfig', async (request, reply) => {
    const { plugin } = request.body
    const plugins = getPluginsList()
    if (plugin && plugins.includes(plugin)) {
      const { config, view, associated } = getPluginConfig(plugin)
      return reply.send({
        status: 'success',
        data: config,
        view,
        associated
      })
    } else {
      return reply.send({
        status: 'failed',
        data: [],
        message: '错误，插件不存在！'
      })
    }
  })

  // 设置插件配置
  await fastify.post('/SetPluginConfig', async (request, reply) => {
    const { plugin, config } = request.body
    const plugins = getPluginsList()
    if (plugin && plugins.includes(plugin)) {
      let changeConfig = []
      for (let cfg of config) {
        const change = setPluginConfig(plugin, cfg.file, cfg.key, cfg.value)
        if (change && change.value != change.change) {
          changeConfig.push(change)
        }
      }
      return reply.send({
        status: 'success',
        data: changeConfig
      })
    } else {
      return reply.send({
        status: 'failed',
        data: [],
        message: '错误，插件不存在！'
      })
    }
  })
}
