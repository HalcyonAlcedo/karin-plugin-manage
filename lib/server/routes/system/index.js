import Bot from './bot.js';
import Karin from './karin.js';
import Terminal from './terminal.js';
export default async (fastify) => {
    /**
     * GET请求
     */
    // 默认页面
    fastify.get('/', async (_request, reply) => {
        return reply.sendFile('page/system/index.html');
    });
    /**
     * POST请求
     */
    fastify.post('/verify', async (_request, reply) => {
        reply.send({ status: 'success', message: 'verify success' });
    });
    Bot(fastify);
    Karin(fastify);
    Terminal(fastify);
};
