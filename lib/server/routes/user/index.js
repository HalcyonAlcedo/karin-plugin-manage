import { UserManager } from '../../../user/index.js'

export default async (fastify, options) => {

  /**
   * GET请求
   */

  // 默认页面
  await fastify.get('/', async (request, reply) => {
    return reply.sendFile('page/config/index.html')
  })


  /**
   * POST请求
   */

  // 用户注册 NOCOMMIT:不应当允许通过api进行用户注册，这里作为开发时调试使用
  if (options.dev)
    await fastify.post('/register', async (request, reply) => {
      const { username, password } = request.body;
      try {
        // 检查用户名是否已存在
        const userExists = UserManager.users.some(user => user.username === username);
        if (userExists) {
          throw new Error('Username already exists');
        }
        // 添加用户
        UserManager.addUser(username, password, ['^/user/.*$']); // 默认只有/user的访问权限
        return reply.send({ status: 'success', message: 'User registered successfully' });
      } catch (error) {
        return reply.status(400).send({ status: 'error', message: error.message });
      }
    })

  // 用户登陆
  await fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;
    try {
      const loginResult = await UserManager.login(username, password);
      if (!loginResult) {
        throw new Error('Invalid username or password');
      }
      return reply.send({ status: 'success', data: loginResult });
    } catch (error) {
      return reply.status(401).send({ status: 'error', message: error.message });
    }
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
}
