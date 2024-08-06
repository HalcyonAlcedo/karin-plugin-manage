import Auth from './auth.js';
import Info from './info.js';
import Management from './management.js';
export default async (fastify) => {
    /**
     * GET请求
     */
    // 默认页面
    fastify.get('/', async (_request, reply) => {
        return reply.sendFile('page/user/index.html');
    });
    /**
     * POST请求
     */
    Auth(fastify);
    Info(fastify);
    Management(fastify);
};
