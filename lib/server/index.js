import { logger } from 'node-karin';
import { config, dirPath } from '../imports/index.js';
import { startServer, restartServer } from './server.js';
import wormhole from './wormhole.js';
let fastify;
// 启动服务器
export async function start() {
    if (fastify)
        return;
    try {
        // 启动wormhole客户端
        wormhole();
    }
    catch (error) {
        logger.error('启动manage-wormhole服务时出错:', error);
    }
    try {
        // 启动api服务
        fastify = await startServer({
            port: config.Server.port,
            debug: config.Server.debug,
            dirname: dirPath
        });
        logger.info(`karin-plugin-manage服务已启动，端口:${config.Server.port || 3000}`);
    }
    catch (err) {
        logger.error('启动karin-plugin-manage服务时出错:', err);
    }
}
// 重启服务器
export async function restart() {
    if (!fastify)
        return false;
    try {
        logger.info(`karin-plugin-manage服务重启中...`);
        // 重启api服务
        fastify = await restartServer(fastify, {
            port: config.Server.port,
            debug: config.Server.debug,
            dirname: dirPath
        });
        logger.info(`karin-plugin-manage服务已重启，端口:${config.Server.port || 3000}`);
        return true;
    }
    catch (err) {
        logger.error('启动karin-plugin-manage服务时出错:', err);
        return false;
    }
}
