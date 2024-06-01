import WebSocket from 'ws'
import axios from 'axios'
import { logger, Cfg as karinCfg } from '#Karin'
import { Config as Cfg } from '#Plugin'
const Config = Cfg.getConfig('server')
const clientId = Config.wormhole?.clientId
const wsUrl = Config.wormhole?.server + clientId

let ws
let reConnect
let adapter

const wormhole = () => {
  if (!Config.wormhole?.enable) return
  if (!Config.wormhole?.clientId || !Config.wormhole?.server) {
    logger.warn(`未配置wormhole服务器或客户端id，禁用wormhole`)
    return
  }
  let heartbeat
  reConnect = undefined
  ws = new WebSocket(wsUrl)
  ws.on('open', function open() {
    logger.info('连接到wormhole服务器' + wsUrl)
    // 发送心跳
    heartbeat = setInterval(() => {
      ws.send(JSON.stringify({ type: 'heartbeat', date: new Date() }))
    }, 30000) // 每30秒发送一次心跳
  })

  ws.on('message', function incoming(data) {
    try {
      data = JSON.parse(data)
    } catch (error) {
      if (Config.debug) {
        logger.warn(`收到非法消息${data}`)
      }
    }
    switch (data.type) {
      case 'web':
        if (data.path) {
          const apiPath = data.path
          const query = data.query
          const body = data.body
          const headers = data.headers
          if (query.html) {
            ws.send(JSON.stringify({ type: 'web', command: 'redirect', path: apiPath, target: query.html.startsWith('/') ? query.html.slice(1) : query.html }))
            return
          }

          if (Config.debug) {
            logger.info(`获取api数据:${apiPath}`)
          }
          // 获取数据
          axios.post(`http://localhost:${Config.port}/${apiPath}`, body || {} ,{
            headers: {
              authorization: headers.authorization || ''
            }
          }).then((data) => {
            let message = {
              type: 'web',
              path: apiPath,
              command: 'postapi',
              data: data.data,
              state: 'complete'
            }
            ws.send(JSON.stringify(message))
          }).catch((err) => {
            ws.send(JSON.stringify({ type: 'web', state: 'error', error: {status: err.response?.status || 500, message: err.response?.statusText || err.message} }))
          })
        } else {
          ws.send(JSON.stringify({ type: 'web', state: 'error', error: '错误的数据路径' }))
        }
        break
      case 'ws':
        if (!adapter) {
          adapter = new WebSocket(`ws://localhost:${karinCfg.Config.http_port}/${data.path}`)
          adapter.on('message', message => {
            ws.send(JSON.stringify({ type: 'ws', command: 'reply', path: data.path, state: 'complete', data: JSON.parse(message)}))
          })
          adapter.on('close', () => {
            ws.send(JSON.stringify({ type: 'ws', state: 'error', error: 'Local adapter close'}))
            adapter = null
          })
          adapter.on('error', () => {
            ws.send(JSON.stringify({ type: 'ws', state: 'error', error: 'Local adapter error'}))
            adapter = null
          })
        }
        if (data.command === 'close') {
          adapter.close()
          adapter = null
        }
        if (data.message && adapter.readyState === WebSocket.OPEN) {
          adapter.send(JSON.stringify(data.message))
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
