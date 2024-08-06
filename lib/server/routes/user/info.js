import { Cfg } from 'node-karin';
import bcrypt from 'bcryptjs';
import { getBots, common } from '../../../imports/index.js';
import { UserManager } from '../../../core/user/index.js';
export default async (fastify) => {
    // 获取快速登陆用户列表
    fastify.post('/getLoginUserInfo', async (_request, reply) => {
        const bots = Object.keys(getBots()).map((bot) => ({ bot: common.ellipsisMiddle(bot.toString()), hash: bcrypt.hashSync(bot.toString(), 12) }));
        const masters = Cfg.Config.master.map((bot) => ({ bot: common.ellipsisMiddle(bot.toString()), hash: bcrypt.hashSync(bot.toString(), 12) }));
        reply.send({ status: 'success', data: { bots, masters } });
    });
    // 检查用户
    fastify.post('/check-user', async (_request, reply) => {
        reply.send({ status: 'success', message: 'Check user success' });
    });
    // 获取面板用户列表
    fastify.post('/userList', async (_request, reply) => {
        const list = UserManager.users
            .filter(item => item.username != null)
            .map(({ password, ...rest }) => rest); // 移除password属性
        reply.send({ status: 'success', data: list });
    });
};
