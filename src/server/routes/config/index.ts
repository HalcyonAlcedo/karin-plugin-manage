import PluginPost from './plugin'
import KarinPost from './karin'
import WidgetsPost from './widgets'
export default async (fastify:any, _options:any) => {
  /**
   * GET请求
   */

  // 默认页面
  await fastify.get('/', async (_request:any, reply:any) => {
    return reply.sendFile('page/config/index.html')
  })


  /**
   * POST请求
   */
  PluginPost(fastify)
  KarinPost(fastify)
  WidgetsPost(fastify)
}
