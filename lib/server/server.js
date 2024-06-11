import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import cors from '@fastify/cors'
import websocketPlugin from '@fastify/websocket'
import path from 'path'
import routesManagement from './routes/index.js'

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

  // 返回Fastify实例
  return fastify
}
