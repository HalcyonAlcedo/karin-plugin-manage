import { redis } from '#Karin'
import jwt from 'jsonwebtoken'
import Cfg from '../../config.js'

// 路由守护
async function routeGuard(request, reply) {
  const url = request.raw.url || request.routeOptions.url
  // 放行登陆请求
  switch (url) {
    case '/user/login':
      return
    case '/user/quickLogin':
      return
    case '/system/verify':
      return
  }

  try {
    const token = request.headers.authorization?.split(' ')[0]
    if (!token) {
      throw new Error('No authorization token provided')
    }
    const SECRET_KEY = Cfg.getConfig('server').secretKey
    const decoded = jwt.verify(token, SECRET_KEY)
    const redisToken = await redis.get(`karin-plugin-manage:user:${decoded.username}:token`)
    const hasAccess = decoded.routes.some(route => {
      const isRegexPattern = (pattern) => {
        try {
          new RegExp(pattern)
          return true
        } catch (e) {
          return false
        }
      }
      if (isRegexPattern(route)) {
        const regex = new RegExp(route)
        return regex.test(url)
      }
      return route === url
    })
    if (!hasAccess || token !== redisToken) {
      throw new Error('Unauthorized access')
    }
  } catch (error) {
    console.error(error)
    reply.status(401).send({ status: 'error', error: 'Unauthorized' })
  }
}

export default routeGuard
