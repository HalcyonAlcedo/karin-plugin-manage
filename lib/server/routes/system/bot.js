import { getBotList } from '../../../core/system/index.js';
export default async (fastify) => {
    // 获取Bot列表
    await fastify.post('/GetBotList', async (_request, reply) => {
        const botList = await getBotList();
        return reply.send({
            status: 'success',
            data: botList
        });
    });
};
