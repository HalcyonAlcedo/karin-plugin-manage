import { Cfg } from 'node-karin';
import { config } from '../../../imports/index.js';
import { getRendererList, getLogs } from '../../../core/system/index.js';
import { restart } from '../../../server/index.js';
export default async (fastify) => {
    // 获取渲染器列表
    fastify.post('/GetRendererCount', async (_request, reply) => {
        const rendererList = await getRendererList();
        return reply.send({
            status: 'success',
            data: rendererList.length || 0
        });
    });
    // 获取karin版本
    fastify.post('/GetKarinVersion', async (_request, reply) => {
        return reply.send({
            status: 'success',
            data: Cfg.package.version
        });
    });
    // 获取运行日志
    fastify.post('/GetKarinLogs', async (request, reply) => {
        const { number = 20, level, lastTimestamp } = request.body;
        let logs;
        try {
            logs = getLogs(number, level, lastTimestamp);
            return reply.send({
                status: 'success',
                data: logs
            });
        }
        catch (error) {
            return reply.send({
                status: 'failed',
                meaasge: error.toString()
            });
        }
    });
    // 获取adapter端口
    fastify.post('/GetAdapterPort', async (_request, reply) => {
        return reply.send({
            status: 'success',
            data: {
                port: Cfg.Server.http.port,
                server: config.Server.port,
                wormhole: config.Server.wormhole.enable
            }
        });
    });
    // 重启服务
    fastify.post('/restartServer', async (_request, reply) => {
        await reply.send({
            status: 'success'
        });
        restart();
    });
};
