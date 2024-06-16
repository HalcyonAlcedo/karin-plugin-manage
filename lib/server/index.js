import { logger } from '#Karin'
import { Config, dirPath } from '#Plugin'
import { startServer, restartServer } from './server.js'
import wormhole from './wormhole.js'

let fastify

// 启动服务器
export async function start() {
  if (fastify) return
  const config = Config.getConfig('server')
  const options = {
    port: config.port,
    debug: config.debug,
    dirname: dirPath
  }
  try {
    // 启动wormhole客户端
    wormhole()
    // 启动api服务
    fastify = await startServer(options)
    logger.info(`karin-plugin-manage服务已启动，端口:${config.port || 3000}`)
  } catch (err) {
    logger.error('启动karin-plugin-manage服务时出错:', err)
  }
}

// 重启服务器
export async function restart() {
  if (!fastify) return false
  const config = Config.getConfig('server')
  const options = {
    port: config.port,
    debug: config.debug,
    dirname: dirPath
  }
  try {
    logger.info(`karin-plugin-manage服务重启中...`)
    // 重启api服务
    fastify = await restartServer(fastify, options)
    logger.info(`karin-plugin-manage服务已重启，端口:${config.port || 3000}`)
    return true
  } catch (err) {
    logger.error('启动karin-plugin-manage服务时出错:', err)
    return false
  }
}
