import routeGuard from './guard'
import { UserManager } from '@plugin/core/user'

export default async function routesManagement(fastify:any, options:any) {
  // 添加用户数据
  await fastify.addHook('onRequest', async (request:any, reply: any) => {
    request.userManager = UserManager
  })
  // 配置路由守护
  await fastify.addHook('preHandler', routeGuard)
}
