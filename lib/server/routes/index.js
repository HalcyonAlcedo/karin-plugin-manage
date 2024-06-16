import routeGuard from './guard.js'
import { UserManager } from '../../user/index.js'

export default async function routesManagement(fastify, options) {
  // 添加用户数据
  await fastify.addHook('onRequest', async (request, reply) => {
    request.userManager = UserManager
  })
  // 配置路由守护
  await fastify.addHook('preHandler', routeGuard)
}
