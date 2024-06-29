import { segment, Cfg } from '#Karin'
import { getBots, ellipsisMiddle } from '#Plugin'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { UserManager } from '../../../user/index.js'

function getOtp() {
  const characters = '0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default async (fastify, options) => {

  /**
   * GET请求
   */

  // 默认页面
  await fastify.get('/', async (request, reply) => {
    return reply.sendFile('page/user/index.html')
  })


  /**
   * POST请求
   */

  // 用户注册
  await fastify.post('/register', async (request, reply) => {
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
    } catch (error) {
      return reply.status(400).send({ status: 'error', message: error.message });
    }
  })

  // 用户登陆
  await fastify.post('/login', async (request, reply) => {
    const { username, password, remember } = request.body;
    try {
      const loginResult = await UserManager.login(username, password, remember);
      if (!loginResult) {
        throw new Error('Invalid username or password');
      }
      return reply.send({ status: 'success', data: loginResult });
    } catch (error) {
      return reply.status(401).send({ status: 'error', message: error.message });
    }
  });

  // 快速登陆
  await fastify.post('/quickLogin', async (request, reply) => {
    // 获取机器人列表
    const { bot, qq, otp } = request.body;

    if (otp && bot) {
      try {
        const loginResult = await UserManager.quickLogin(otp, bot);
        if (!loginResult) {
          throw new Error('Invalid username or password');
        }
        return reply.send({ status: 'success', data: loginResult });
      } catch (error) {
        return reply.status(401).send({ status: 'error', message: error.message });
      }
    }

    for (const uid in getBots()) {
      // 处理加密qq
      let _bot
      if (uid === bot.toString()) {
        _bot = bot
      } else if (bcrypt.compareSync(uid, bot)) {
        _bot = uid
      }

      if (_bot) {
        // 检查账号
        const userExists = UserManager.checkUser(_bot);
        if (!userExists) {
          const password = crypto.randomBytes(32).toString().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
          UserManager.addUser(_bot, password, ['^/user/.*$', '^/config/.*$', '^/system/.*$']);
        }

        const authCode = getOtp()
        try {
          const otpBot = getBots(_bot)
          // 处理加密master
          let _qq = Cfg.Config.master.find(master => master.toString() === qq.toString())
          if (!_qq) {
            _qq = Cfg.Config.master.find(master => bcrypt.compareSync(master.toString(), qq.toString()))
          }
          if (_qq) {
            await otpBot.send_private_msg(parseInt(_qq), [segment.text(`收到快速登陆请求：${authCode}`)])
            await UserManager.setOtp(authCode, 180)
            return reply.send({ status: 'success' });
          } else {
            return reply.send({ status: 'failed', message: 'Master Is Not Found!' });
          }
        } catch (error) {
          return reply.send({ status: 'failed', message: 'Bot Send Message Error!' });
        }
      }
    }
    return reply.send({ status: 'failed', message: 'Bot Not online!' });
  });

  // 获取快速登陆用户列表
  await fastify.post('/getLoginUserInfo', async (request, reply) => {
    const bots = Object.keys(getBots()).map((bot) => ({ bot: ellipsisMiddle(bot.toString()), hash: bcrypt.hashSync(bot.toString(), 12) }))
    const masters = Cfg.Config.master.map((bot) => ({ bot: ellipsisMiddle(bot.toString()), hash: bcrypt.hashSync(bot.toString(), 12) }))

    reply.send({ status: 'success', data: { bots, masters } });

  });

  // 更新 Token 时间
  await fastify.post('/refresh-token', async (request, reply) => {
    const { username, token } = request.body;
    try {
      await UserManager.refreshToken(username, token);
      reply.send({ status: 'success', message: 'Token refreshed successfully' });
    } catch (error) {
      reply.status(400).send({ status: 'error', message: error.message });
    }
  });

  // 用户注销
  await fastify.post('/logout', async (request, reply) => {
    const { username } = request.body;
    const token = request.headers.authorization.split(' ')[0]
    try {
      if (await UserManager.logout(username, token)) {
        return reply.send({ status: 'success', message: 'User logged out successfully' });
      } else {
        return reply.send({ status: 'failed', message: 'User logged out failed' });
      }
    } catch (error) {
      return reply.status(400).send({ status: 'error', message: error.message });
    }
  });

  // 修改密码
  await fastify.post('/change-password', async (request, reply) => {
    const { username, oldPassword, newPassword } = request.body;
    try {
      // 验证旧密码是否正确
      if (await UserManager.validatePassword(username, oldPassword)) {
        // 更新密码
        if (await UserManager.changePassword(username, newPassword)) {
          reply.send({ status: 'success', message: 'Password changed successfully' });
        } else {
          reply.send({ status: 'failed', message: 'Password save failed' });
        }
      } else {
        reply.send({ status: 'failed', message: 'Old password verification failed' });
      }
    } catch (error) {
      reply.status(400).send({ status: 'error', message: error.message });
    }
  });

  // 修改用户权限
  await fastify.post('/change-permissions', async (request, reply) => {
    const { username, permissions } = request.body;
    try {
      try {
        if (await UserManager.changePermissions(username, permissions)) {
          reply.send({ status: 'success', message: 'Permissions updated successfully' });
        } else {
          reply.send({ status: 'failed', message: 'Permissions updated failed' });
        }
      } catch (error) {
        reply.send({ status: 'failed', message: error.message });
      }
    } catch (error) {
      reply.status(400).send({ status: 'error', message: error.message });
    }
  });

  // 检查用户
  await fastify.post('/check-user', async (request, reply) => {
    reply.send({ status: 'success', message: 'Check user success' });
  });

  // 获取面板用户列表
  await fastify.post('/userList', async (request, reply) => {
    const list = UserManager.users
      .filter(item => item.username != null)
      .map(({ password, ...rest }) => rest); // 移除password属性
    reply.send({ status: 'success', data: list });
  });
}
