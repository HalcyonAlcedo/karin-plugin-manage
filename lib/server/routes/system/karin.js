import { Cfg } from '#Karin'
import { Config } from '#Plugin'
import { getRendererList, getLogs } from '../../../system/index.js'
import { restart } from '../../index.js'

export default async (fastify) => {
  // 获取渲染器列表
  await fastify.post('/GetRendererCount', async (request, reply) => {
    const rendererList = await getRendererList()
    return reply.send({
      status: 'success',
      data: rendererList.length || 0
    })
  })
  // 获取karin版本
  await fastify.post('/GetKarinVersion', async (request, reply) => {
    return reply.send({
      status: 'success',
      data: Cfg.package.version
    })
  })
  // 获取运行日志
  await fastify.post('/GetKarinLogs', async (request, reply) => {
    const number = request.body?.number
    const level = request.body?.level
    const lastTimestamp = request.body?.lastTimestamp
    let logs
    try {
      logs = getLogs(number || 20, level, lastTimestamp)
      return reply.send({
        status: 'success',
        data: logs
      })
    } catch (error) {
      return reply.send({
        status: 'failed',
        meaasge: error
      })
    }
  })
  // 获取adapter端口
  await fastify.post('/GetAdapterPort', async (request, reply) => {
    return reply.send({
      status: 'success',
      data: {
        port: Cfg.Server.http.port,
        server: Config.Server.port,
        wormhole: Config.Server.wormhole.enable
      }
    })
  })
  // 重启服务
  await fastify.post('/restartServer', async (request, reply) => {
    await reply.send({
      status: 'success'
    })
    restart()
  })
}
