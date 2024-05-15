import server from './server.js'
import Cfg from '../config.js'

const config = Cfg.getConfig('server')

const options = {
  port: config.port,
  debug: config.debug,
  dev: config.dev,
  dirname: './plugins/karin-plugin-manage'
}
// 初始化服务器
const fastify = await server(options)

// 启动服务器
export default async () => {
  try {
    await fastify.listen({ port: options.port || 3000, host: '::' })
    console.log(`karin-plugin-manage服务已启动，端口:${options.post || 3000}`)
  } catch (err) {
    console.error('启动karin-plugin-manage服务时出错:', err)
    process.exit(1)
  }
}
