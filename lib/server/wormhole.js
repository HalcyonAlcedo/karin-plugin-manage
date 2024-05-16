import WebSocket from 'ws'
import axios from 'axios'
import { logger } from '#Karin'
import Cfg from '../config.js'
const Config = Cfg.getConfig('server')
const clientId = Config.wormhole?.clientId
const wsUrl = Config.wormhole?.server + clientId

let ws
let reConnect

const wormhole = () => {
  if (!Config.wormhole?.enable) return
  if (!Config.wormhole?.clientId || !Config.wormhole?.server) {
    logger.warn(`未配置wormhole服务器或客户端id，禁用wormhole`)
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
      logger.warn(`收到非法消息${data}`)
    }
    switch (data.type) {
      case 'web':
        if (data.path) {
          const apiPath = data.path
          const query = data.query
          const body = data.body
          if (query.html) {
            ws.send(JSON.stringify({ type: 'web', command: 'redirect', path: apiPath, target: query.html.startsWith('/') ? query.html.slice(1) : query.html }))
            return
          }

          logger.info(`获取api数据:${apiPath}`)
          // 获取数据
          axios.post(`http://localhost:${Config.port}/${apiPath}`, body).then((data) => {
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
      default:
        break
    }
  })

  ws.on('close', function close() {
    if (heartbeat) {
      clearInterval(heartbeat)
      heartbeat = null
    }
    logger.warn('wormhole连接关闭，10秒后尝试重新连接')
    if (!reConnect) {
      reConnect = setTimeout(wormhole, 10000)
    }
  })

  ws.on('error', function error() {
    if (heartbeat) {
      clearInterval(heartbeat)
      heartbeat = null
    }
    logger.warn('wormhole连接错误，10秒后尝试重新连接')
    if (!reConnect) {
      reConnect = setTimeout(wormhole, 10000)
    }
  })

}

export default wormhole
