import { Cfg } from 'node-karin'
import { FastifyInstance } from 'fastify/types/instance'
import { config } from '@plugin/imports'
import { getRendererList, getLogs, Log } from '@plugin/core/system'
import { restart } from '@plugin/server'

export default async (fastify: FastifyInstance) => {
  // 获取渲染器列表
  fastify.post('/GetRendererCount', async (_request, reply) => {
    const rendererList = await getRendererList()
    return reply.send({
      status: 'success',
      data: rendererList.length || 0
    })
  })
  // 获取karin版本
  fastify.post('/GetKarinVersion', async (_request, reply) => {
    return reply.send({
      status: 'success',
      data: Cfg.package.version
    })
  })
  // 获取运行日志
  fastify.post('/GetKarinLogs', async (request, reply) => {
    const { number = 20, level, lastTimestamp } = request.body as { number: number, level?: string, lastTimestamp?: string }
    let logs: Log[]
    try {
      logs = getLogs(number, level, lastTimestamp)
      return reply.send({
        status: 'success',
        data: logs
      })
    } catch (error: any) {
      return reply.send({
        status: 'failed',
        meaasge: error.toString()
      })
    }
  })
  // 获取adapter端口
  fastify.post('/GetAdapterPort', async (_request, reply) => {
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
  fastify.post('/restartServer', async (_request, reply) => {
    await reply.send({
      status: 'success'
    })
    restart()
  })
}
