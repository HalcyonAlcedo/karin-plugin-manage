import Fastify from 'fastify'
import cors from '@fastify/cors'
import autoLoad from '@fastify/autoload'
import fastifyStatic from '@fastify/static'
import websocketPlugin from '@fastify/websocket'
import path from 'path'
import fs from 'fs'
import routesManagement from './routes'
import { getPluginsList } from '@plugin/core/config'
import { dirPath } from '@plugin/imports'
import { FastifyInstance } from 'fastify/types/instance'

interface Options {
  port: number
  debug: boolean
  dirname: string
}
export async function server(options: Options): Promise<FastifyInstance> {
  // 创建Fastify实例
  const fastify = Fastify({ logger: options.debug })

  // 注册WebSocket插件
  await fastify.register(websocketPlugin)

  // 配置跨域请求
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST']
  })

  // 注册静态资源
  await fastify.register(fastifyStatic, {
    root: path.resolve(path.join(options.dirname, 'resources')),
    prefix: '/static/',
  })

  // 路由管理
  await routesManagement(fastify, options)

  // 注册路由
  await fastify.register(autoLoad, {
    dir: path.resolve(path.join(dirPath, 'lib/server/routes')),
    dirNameRoutePrefix: true
  })

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

export async function startServer(options: Options): Promise<FastifyInstance> {
  // 初始化服务器
  const fastify = await server(options)
  // 创建监听
  await fastify.listen({ port: options.port || 3000, host: '::' })
  return fastify
}

export async function restartServer(fastifyInstance: FastifyInstance, options: Options): Promise<FastifyInstance> {
  await fastifyInstance.close()
  // 初始化服务器
  const fastify = await server(options)
  // 创建监听
  await fastify.listen({ port: options.port || 3000, host: '::' })
  return fastify
}
