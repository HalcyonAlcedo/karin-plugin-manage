import { Cfg, redis } from '#Karin'
import { Config } from '#Plugin'
import moment from 'moment'
import { getRendererList, getPluginsAppList, getLogs } from '../../../system/index.js'

async function getStatsList (key) {
  const statsList = []
  /** 对于30天的统计，预先生成所有可能的键 */
  const keys = Array.from({ length: 30 }, (_, i) => {
    const date = moment().subtract(i, 'days').format('YYYY-MM-DD')
    return { key: `${key}:${date}`, date }
  })

  for (const { key: k, date } of keys) {
    const value = Number(await redis.get(k)) || 0
    statsList.push({ date, value })
  }

  return statsList
}
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
  // 获取插件配置
  await fastify.post('/GetAppCommands', async (request, reply) => {
    const formatCommand = (data) => {
      const instructions = {}

      // 将指令按照 file.dir 分类
      data.forEach(command => {
        const { file, name, rule } = command
        if (!instructions[file.dir]) {
          instructions[file.dir] = {}
        }

        // 添加子类和对应的规则
        instructions[file.dir][name] = rule.map(r => {
          return { reg: r.reg, example: r.reg.replace(/\//g, '').replace(/\^|\$/g, '') }
        })
      })

      return instructions
    }

    return reply.send({
      status: 'success',
      data: formatCommand(getPluginsAppList())
    })
  })
  // 获取插件配置
  await fastify.post('/GetCommandsList', async (request, reply) => {
    const formatCommand = (data) => {
      const commands = {}

      data.forEach(command => {
        const { file, name, rule, priority } = command
        const uniqueName = commands[name] ? `${file.dir} - ${name}` : name

        rule.forEach(r => {
          if (!commands[uniqueName]) {
            commands[uniqueName] = []
          }

          const existingRuleIndex = commands[uniqueName].findIndex(c => c.reg === r.reg)
          if (existingRuleIndex > -1) {
            // 如果正则表达式已存在，比较priority值
            if (commands[uniqueName][existingRuleIndex].priority > priority) {
              commands[uniqueName][existingRuleIndex] = { reg: r.reg, priority }
            }
          } else {
            commands[uniqueName].push({ reg: r.reg, priority })
          }
        })
      })

      // 移除priority属性，只保留正则表达式
      for (const key in commands) {
        commands[key] = commands[key].map(c => c.reg)
      }

      return commands
    }

    return reply.send({
      status: 'success',
      data: formatCommand(getPluginsAppList())
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

}
