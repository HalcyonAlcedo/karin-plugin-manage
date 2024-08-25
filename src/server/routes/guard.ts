import jwt from 'jsonwebtoken'
import { UserManager } from '@plugin/core/user'

const allowList = [
  /^\/user\/login$/,
  /^\/user\/quickLogin$/,
  /^\/system\/verify$/,
  /^\/user\/getLoginUserInfo$/
]

// 路由守护
async function routeGuard(request: any, reply: any) {
  const url = request.raw.url || request.routeOptions.url

  // 放行请求
  const isAllowed = allowList.some((regex) => regex.test(url))
  if (isAllowed) {
    return
  }

  try {
    const token = request.headers.authorization?.split(' ')[0] || request.headers['sec-websocket-protocol']?.split(' ')[0]
    if (!token) {
      reply.status(401).send({ status: 'error', error: 'No authorization token provided' })
    }
    const SECRET_KEY = UserManager.secretKey
    if (SECRET_KEY) {
      try {
        const decoded: any = jwt.verify(token, SECRET_KEY)
        if (UserManager.checkUser(decoded.username)) {
          const userToken = await UserManager.users.find(u => u.username === decoded.username)?.permissions.getToken()
          const hasAccess = decoded.routes.some((route: string) => {
            const isRegexPattern = (pattern: string) => {
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
        } else {
          reply.status(401).send({ status: 'error', error: 'Unauthorized' })
        }
      } catch (error) {
        reply.status(401).send({ status: 'error', error: 'Unauthorized' })
      }
    } else {
      reply.status(500).send({ status: 'error', error: 'Server Error' })
    }
  } catch (error) {
    reply.status(500).send({ status: 'error', error: 'Server Error' })
  }
}

export default routeGuard
