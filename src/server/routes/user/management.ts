import { FastifyInstance } from 'fastify/types/instance'
import { UserManager } from '@plugin/core/user'

export default async (fastify: FastifyInstance) => {
  // 更新 Token 时间
  fastify.post('/refresh-token', async (request, reply) => {
    const { username, token } = request.body as { username: string, token: string }
    try {
      await UserManager.refreshToken(username, token)
      reply.send({ status: 'success', message: 'Token refreshed successfully' })
    } catch (error: any) {
      return reply.status(400).send({ status: 'error', message: error.toString() })
    }
  })

  // 修改密码
  fastify.post('/change-password', async (request, reply) => {
    const { username, oldPassword, newPassword } = request.body as { username: string, oldPassword: string, newPassword: string }
    try {
      // 验证旧密码是否正确
      if (await UserManager.validatePassword(username, oldPassword)) {
        // 更新密码
        if (await UserManager.changePassword(username, newPassword)) {
          reply.send({ status: 'success', message: 'Password changed successfully' })
        } else {
          reply.send({ status: 'failed', message: 'Password save failed' })
        }
      } else {
        reply.send({ status: 'failed', message: 'Old password verification failed' })
      }
    } catch (error: any) {
      return reply.status(400).send({ status: 'error', message: error.toString() })
    }
  })

  // 修改用户权限
  fastify.post('/change-permissions', async (request, reply) => {
    const { username, permissions } = request.body as { username: string, permissions: string[] }
    try {
      try {
        if (await UserManager.changePermissions(username, permissions)) {
          reply.send({ status: 'success', message: 'Permissions updated successfully' })
        } else {
          reply.send({ status: 'failed', message: 'Permissions updated failed' })
        }
      } catch (error: any) {
        return reply.send({ status: 'failed', message: error.toString() })
      }
    } catch (error: any) {
      return reply.status(400).send({ status: 'error', message: error.toString() })
    }
  })
}
