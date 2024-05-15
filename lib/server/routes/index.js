import routeGuard from './guard.js'
import configRoutes from './config/index.js'
import userRoutes from './user/index.js'
import systemRoutes from './system/index.js'
import { UserManager } from '../../user/index.js'

export default async function routesManagement(fastify, options) {
  // 添加用户数据
  await fastify.addHook('onRequest', async (request, reply) => {
    request.userManager = UserManager
  })
  // 配置路由守护
  await fastify.addHook('preHandler', routeGuard)
  // config路由
  await fastify.register(configRoutes, { prefix: '/config', options })
  // user路由
  await fastify.register(userRoutes, { prefix: '/user', options })
  // system路由
  await fastify.register(systemRoutes, { prefix: '/system', options })
}
