import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import cors from '@fastify/cors'
import websocketPlugin from '@fastify/websocket'
import autoLoad from '@fastify/autoload'
import path from 'path'
import fs from 'fs'
import routesManagement from './routes/index.js'
import { getPluginsList } from '../config/plugin.js'

export default async function server(options) {
  // 创建Fastify实例
  const fastify = Fastify({ logger: options.debug })

  // 注册WebSocket插件
  await fastify.register(websocketPlugin)

  // 配置跨域请求
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST']
  });

  // 注册静态资源
  await fastify.register(fastifyStatic, {
    root: path.resolve(path.join(options.dirname, 'resources')),
    prefix: '/static/',
  })

  // 注册路由
  await routesManagement(fastify, options)

  // 注册插件路由
  const plugins = getPluginsList()
  for (const plugin of plugins) {
    const managePath = `plugins/${plugin}/manage/server`
    if (fs.existsSync(managePath)) {
      await fastify.register(autoLoad, {
        dir: path.resolve(managePath),
        options: { prefix: `system/plugins/${plugin}` }
      })
    }
  }
  // 返回Fastify实例
  return fastify
}
