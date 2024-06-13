import PluginPost from './plugin.js'
import KarinPost from './karin.js'
import WidgetsPost from './widgets.js'
export default async (fastify, options) => {
  /**
   * GET请求
   */

  // 默认页面
  await fastify.get('/', async (request, reply) => {
    return reply.sendFile('page/config/index.html')
  })


  /**
   * POST请求
   */
  PluginPost(fastify)
  KarinPost(fastify)
  WidgetsPost(fastify)
}
