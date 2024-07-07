import WebSocket from 'ws'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { logger, Cfg as karinCfg } from 'node-karin'
import { config as Cfg } from '@plugin/imports'
import { UserManager } from '@plugin/core/user'

let ws: WebSocket
let adapter: WebSocket | null
let reConnect: NodeJS.Timeout | undefined

const wormhole = () => {
  const Config = Cfg.Server
  const clientId = Config.wormhole?.clientId
  const wsUrl = Config.wormhole?.server + clientId

  if (!Config.wormhole?.enable) return
  if (!Config.wormhole?.clientId || !Config.wormhole?.server) {
    logger.warn(`未配置wormhole服务器或客户端id，禁用wormhole`)
    return
  }
  let heartbeat: string | number | NodeJS.Timeout | null | undefined
  reConnect = undefined
  ws = new WebSocket(wsUrl)
  ws.on('open', function open() {
    logger.info('连接到wormhole服务器' + wsUrl)
    // 发送心跳
    heartbeat = setInterval(() => {
      ws.send(JSON.stringify({ type: 'heartbeat', date: new Date() }))
    }, 30000) // 每30秒发送一次心跳
  })

  ws.on('message', async (data) => {
    let _data: any
    try {
      _data = JSON.parse(data.toString())
    } catch (error) {
      if (Config.debug) {
        logger.warn(`收到非法消息${data}`)
      }
    }
    const echo = _data.echo
    switch (_data.type) {
      case 'web':
        if (_data.path) {
          const apiPath = _data.path
          const query = _data.query
          const body = _data.body
          const headers = _data.headers
          if (query.html) {
            ws.send(JSON.stringify({ type: 'web', command: 'redirect', path: apiPath, target: query.html.startsWith('/') ? query.html.slice(1) : query.html, echo: echo }))
            return
          }

          if (Config.debug) {
            logger.info(`获取api数据:${apiPath}`)
          }
          // 获取数据
          if (_data.command === 'get') {
            axios.get(`http://localhost:${Config.port}/${apiPath}`, {
              params: body || {},
              headers: {
                authorization: headers.authorization || ''
              }
            }).then((data) => {
              let message = {
                type: 'web',
                path: apiPath,
                command: 'resource',
                data: Buffer.from(JSON.stringify(data.data)).toString('base64'),
                state: 'complete',
                echo: echo
              }
              ws.send(JSON.stringify(message))
            }).catch((err) => {
              ws.send(JSON.stringify({ type: 'web', state: 'error', error: { status: err.response?.status || 500, message: err.response?.statusText || err.message }, echo: echo }))
            })
          } else {
            axios.post(`http://localhost:${Config.port}/${apiPath}`, body || {}, {
              headers: {
                authorization: headers.authorization || ''
              }
            }).then((data) => {
              let message = {
                type: 'web',
                path: apiPath,
                command: 'postapi',
                data: data.data,
                state: 'complete',
                echo: echo
              }
              ws.send(JSON.stringify(message))
            }).catch((err) => {
              ws.send(JSON.stringify({ type: 'web', state: 'error', error: { status: err.response?.status || 500, message: err.response?.statusText || err.message }, echo: echo }))
            })
          }
        } else {
          ws.send(JSON.stringify({ type: 'web', state: 'error', error: '错误的数据路径', echo: echo }))
        }
        break
      case 'ws':
        const token = _data.headers['sec-websocket-protocol']
        if (!adapter) {
          adapter = new WebSocket(`ws://localhost:${_data.query?.port || karinCfg.Server.http.port}/${_data.path}`, token || _data.headers?.authorization)
          if (adapter) {
            adapter.on('open', () => {
              if (adapter) {
                adapter.send(JSON.stringify({ type: 'ping' }))
              }
            })
            adapter.on('message', message => {
              ws.send(JSON.stringify({ type: 'ws', command: 'reply', path: _data.path, state: 'complete', data: JSON.parse(message.toString()) }))
            })
            adapter.on('close', () => {
              ws.send(JSON.stringify({ type: 'ws', state: 'error', error: 'Local adapter close' }))
              adapter = null
            })
            adapter.on('error', () => {
              ws.send(JSON.stringify({ type: 'ws', state: 'error', error: 'Local adapter error' }))
              adapter = null
            })
          }
        }
        if (!token) {
          ws.send(JSON.stringify({ type: 'ws', state: 'error', error: 'Unauthorized' }))
          adapter.close()
          adapter = null
          return
        }

        const SECRET_KEY = UserManager.secretKey
        try {
          if (SECRET_KEY) {
            const decoded: any = jwt.verify(token, SECRET_KEY)
            if (UserManager.checkUser(decoded.username)) {
              const userToken = await UserManager.users.find(u => u.username === decoded.username)?.permissions.getToken()
              if (token !== userToken) {
                ws.send(JSON.stringify({ type: 'ws', state: 'error', error: 'Unauthorized' }))
                adapter.close()
                adapter = null
                return
              }
            } else {
              ws.send(JSON.stringify({ type: 'ws', state: 'error', error: 'Unauthorized' }))
              adapter.close()
              adapter = null
              return
            }
          } else {
            ws.send(JSON.stringify({ type: 'ws', state: 'error', error: 'Unauthorized' }))
            adapter.close()
            adapter = null
            return
          }
        } catch (error) {
          ws.send(JSON.stringify({ type: 'ws', state: 'error', error: 'Unauthorized' }))
          if (adapter) {
            adapter.close()
            adapter = null
          }
          return
        }

        if (_data.command === 'close') {
          adapter.close()
          adapter = null
        }
        if (_data.message && adapter?.readyState === WebSocket.OPEN) {
          adapter.send(JSON.stringify(_data.message))
        }
        break
      default:
        break
    }
  })

  ws.on('close', function close() {
    if (heartbeat) {
      clearInterval(heartbeat)
      heartbeat = null
    }
    if (Config.debug) {
      logger.warn('wormhole连接关闭，10秒后尝试重新连接')
    }
    if (!reConnect) {
      reConnect = setTimeout(wormhole, 10000)
    }
  })

  ws.on('error', function error() {
    if (heartbeat) {
      clearInterval(heartbeat)
      heartbeat = null
    }
    if (Config.debug) {
      logger.warn('wormhole连接关闭，10秒后尝试重新连接')
    }
    if (!reConnect) {
      reConnect = setTimeout(wormhole, 10000)
    }
  })

}

export default wormhole
