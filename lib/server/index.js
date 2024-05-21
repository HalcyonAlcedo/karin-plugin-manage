import { logger } from '#Karin'
import server from './server.js'
import wormhole from './wormhole.js'
import Cfg from '../config.js'

const config = Cfg.getConfig('server')
const options = {
  port: config.port,
  debug: config.debug,
  dirname: './plugins/karin-plugin-manage'
}

// 初始化服务器
const fastify = await server(options)

// 启动服务器
export default async () => {
  try {
    // 启动wormhole客户端
    wormhole()
    await fastify.listen({ port: options.port || 3000, host: '::' })
    logger.info(`karin-plugin-manage服务已启动，端口:${options.port || 3000}`)
  } catch (err) {
    logger.error('启动karin-plugin-manage服务时出错:', err)
    process.exit(1)
  }
}
