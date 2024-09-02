import { config } from '../../../imports/index.js';
export default async (fastify) => {
    // 获取配置文件中的商店列表
    fastify.post('/GetStoreList', async (_request, reply) => {
        try {
            return reply.send({
                status: 'success',
                data: config.Store.storeList
            });
        }
        catch (error) {
            return reply.code(500).send({
                status: 'failed',
                meaasge: error.toString()
            });
        }
    });
};
