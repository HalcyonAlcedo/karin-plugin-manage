import { FastifyInstance } from 'fastify/types/instance'
import { getPluginConfig, getPluginsList, getNpmPluginsList, setPluginConfig, getExamplePluginsList, getPluginsInfo } from '@plugin/core/config'
import { dirName } from 'node-karin'

export default async (fastify: FastifyInstance) => {
  // 获取插件列表
  fastify.post('/GetPluginList', async (_request, reply) => {
    return reply.send({
      status: 'success',
      data: getPluginsList(),
    })
  })

  // 获取npm插件列表
  fastify.post('/GetNpmPluginList', async (_request, reply) => {
    return reply.send({
      status: 'success',
      data: getNpmPluginsList(),
    })
  })

  // 获取插件信息
  fastify.post('/GetPluginInfo', async (request, reply) => {
    const { plugin } = request.body as { plugin: string }
    return reply.send({
      status: 'success',
      data: getPluginsInfo(plugin),
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
    const { plugin } = request.body as { plugin: dirName }
    const plugins = [...getPluginsList(), ...await getNpmPluginsList()]
    if (plugin && plugins.includes(plugin)) {
      const result = await getPluginConfig(plugin)
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
    const { plugin, config } = request.body as { plugin: dirName, config: Array<{ file: string, key: string, value: string | boolean }> }
    const plugins = [...getPluginsList(), ...await getNpmPluginsList()]
    if (plugin && plugins.includes(plugin)) {
      const changeConfig = []
      for (const cfg of config) {
        const change = await setPluginConfig(plugin, cfg.file, cfg.key, cfg.value)
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
