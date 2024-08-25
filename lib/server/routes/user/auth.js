import { karin, segment, Cfg } from 'node-karin';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getBots } from '../../../imports/index.js';
import { UserManager } from '../../../core/user/index.js';
function getOtp() {
    const characters = '0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
export default async (fastify) => {
    // 用户注册
    fastify.post('/register', async (request, reply) => {
        const { username, password } = request.body;
        try {
            // 检查用户名是否已存在
            const userExists = UserManager.users.some(user => user.username === username);
            if (userExists) {
                throw new Error('Username already exists');
            }
            // 添加用户
            UserManager.addUser(username, password, ['^/user/(?!register$|change-permissions$|userList$).*$']); // 默认只有/user的访问权限
            return reply.send({ status: 'success', message: 'User registered successfully' });
        }
        catch (error) {
            return reply.status(400).send({ status: 'error', message: error.toString() });
        }
    });
    // 用户登陆
    fastify.post('/login', async (request, reply) => {
        const { username, password, remember } = request.body;
        try {
            const loginResult = await UserManager.login(username, password, remember);
            if (!loginResult) {
                throw new Error('Invalid username or password');
            }
            return reply.send({ status: 'success', data: loginResult });
        }
        catch (error) {
            return reply.status(400).send({ status: 'error', message: error.toString() });
        }
    });
    // 快速登陆
    fastify.post('/quickLogin', async (request, reply) => {
        // 获取机器人列表
        const { bot, qq, otp } = request.body;
        if (otp && bot) {
            try {
                const loginResult = await UserManager.quickLogin(otp, bot);
                if (!loginResult) {
                    throw new Error('Invalid username or password');
                }
                return reply.send({ status: 'success', data: loginResult });
            }
            catch (error) {
                return reply.status(401).send({ status: 'error', message: error.toString() });
            }
        }
        for (const uid in getBots()) {
            // 处理加密qq
            let _bot;
            if (uid === bot.toString()) {
                _bot = bot;
            }
            else if (bcrypt.compareSync(uid, bot)) {
                _bot = uid;
            }
            if (_bot) {
                // 检查账号
                const userExists = UserManager.checkUser(_bot);
                if (!userExists) {
                    const password = crypto.randomBytes(32).toString().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
                    UserManager.addUser(_bot, password, ['^/user/.*$', '^/config/.*$', '^/system/.*$']);
                }
                const authCode = getOtp();
                try {
                    const otpBot = karin.getBot(_bot);
                    // 处理加密master
                    let _qq = Cfg.Config.master.find(master => master.toString() === qq.toString());
                    if (!_qq) {
                        _qq = Cfg.Config.master.find(master => bcrypt.compareSync(master.toString(), qq.toString()));
                    }
                    if (_qq && otpBot) {
                        await otpBot.SendMessage({ scene: "friend" /* Scene.Private */, peer: _qq }, [segment.text(`收到快速登陆请求：${authCode}`)]);
                        await UserManager.users.find(u => u.username === _bot)?.permissions.setOtp(authCode);
                        return reply.send({ status: 'success' });
                    }
                    else {
                        return reply.send({ status: 'failed', message: 'Master Is Not Found!' });
                    }
                }
                catch (error) {
                    return reply.send({ status: 'failed', message: 'Bot Send Message Error!' });
                }
            }
        }
        return reply.send({ status: 'failed', message: 'Bot Not online!' });
    });
    // 用户注销
    fastify.post('/logout', async (request, reply) => {
        const { username } = request.body;
        const token = request.headers?.authorization?.split(' ')[0];
        try {
            if (token && await UserManager.logout(username, token)) {
                return reply.send({ status: 'success', message: 'User logged out successfully' });
            }
            else {
                return reply.send({ status: 'failed', message: 'User logged out failed' });
            }
        }
        catch (error) {
            return reply.status(400).send({ status: 'error', message: error.toString() });
        }
    });
};
