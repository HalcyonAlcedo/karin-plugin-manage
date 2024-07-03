import { Cfg } from 'node-karin'
import { config } from '@plugin/imports'
import { getRendererList, getLogs } from '@plugin/core/system'
import { restart } from '@plugin/server'

export default async (fastify:any) => {
  // 获取渲染器列表
  fastify.post('/GetRendererCount', async (_request:any, reply:any) => {
    const rendererList = await getRendererList()
    return reply.send({
      status: 'success',
      data: rendererList.length || 0
    })
  })
  // 获取karin版本
  fastify.post('/GetKarinVersion', async (_request:any, reply:any) => {
    return reply.send({
      status: 'success',
      data: Cfg.package.version
    })
  })
  // 获取运行日志
  fastify.post('/GetKarinLogs', async (request:any, reply:any) => {
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
  fastify.post('/GetAdapterPort', async (_request:any, reply:any) => {
    return reply.send({
      status: 'success',
      data: {
        port: Cfg.Server.http.port,
        server: config.Server.port,
        wormhole: config.Server.wormhole.enable
      }
    })
  })
  // 重启服务
  fastify.post('/restartServer', async (_request:any, reply:any) => {
    await reply.send({
      status: 'success'
    })
    restart()
  })
}
