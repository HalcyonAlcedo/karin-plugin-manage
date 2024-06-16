import jwt from 'jsonwebtoken'
import { UserManager } from '../../user/index.js'

const allowList = [
  /^\/user\/login$/,
  /^\/user\/quickLogin$/,
  /^\/system\/verify$/
]

// 路由守护
async function routeGuard(request, reply) {
  const url = request.raw.url || request.routeOptions.url

  // 放行请求
  const isAllowed = allowList.some((regex) => regex.test(url));
  if (isAllowed) {
    return
  }

  try {
    const token = request.headers.authorization?.split(' ')[0] || request.headers['sec-websocket-protocol']?.split(' ')[0]
    if (!token) {
      throw new Error('No authorization token provided')
    }
    const SECRET_KEY = UserManager.secretKey
    const decoded = jwt.verify(token, SECRET_KEY)
    const userToken = await UserManager.getToken(decoded.username)
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
    if (!hasAccess || token !== userToken) {
      reply.status(401).send({ status: 'error', error: 'Unauthorized' })
    }
  } catch (error) {
    reply.status(401).send({ status: 'error', error: 'Unauthorized' })
  }
}

export default routeGuard
