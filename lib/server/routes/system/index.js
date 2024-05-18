import Update from './update.js'
import Bot from './bot.js'
import Karin from './karin.js'

export default async (fastify, options) => {

  /**
   * GET请求
   */


  /**
   * POST请求
   */
  await fastify.post('/verify', async (request, reply) => {
    reply.send({ status: 'success', message: 'verify success' });
  });

  Update(fastify)
  Bot(fastify)
  Karin(fastify)
}
