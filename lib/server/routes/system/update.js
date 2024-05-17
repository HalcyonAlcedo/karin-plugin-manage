import { checkGit, checkGitStatus, pullUpdates } from '../../../update/index.js'

export default async (fastify) => {
  // 获取Manage更新信息
  await fastify.post('/checkManageUpdate', async (request, reply) => {
    if (await checkGit()) {
      try {
        const gitStatus = await checkGitStatus()
        reply.send({ status: 'success', data: gitStatus })
      } catch (error) {
        reply.send({ status: 'failed', message: error.message })
      }
    } else {
      reply.send({ status: 'failed', message: 'Git not installed' })
    }
  })

  // 更新Manage
  await fastify.post('/updateManage', async (request, reply) => {
    if (await checkGit()) {
      try {
        const force = request.body?.force
        const gitStatus = await pullUpdates(force)
        if (gitStatus.success) {
          reply.send({ status: 'success', message: gitStatus.output, backup: gitStatus.backup})
        } else {
          reply.send({ status: 'failed', message: gitStatus.output })
        }
      } catch (error) {
        reply.send({ status: 'failed', message: error.message })
      }
    } else {
      reply.send({ status: 'failed', message: 'Git not installed' })
    }
  })

}
