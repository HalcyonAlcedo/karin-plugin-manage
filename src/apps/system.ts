import fs from 'fs'
import { Renderer, plugin, segment, logger } from 'node-karin'
import { dirname, config } from '@plugin/imports'
import { getLogs } from '@plugin/core/system'

export class System extends plugin {
  constructor() {
    super({
      // 必选 插件名称
      name: 'ManageSystem',
      // 插件描述
      dsc: '管理面板系统',
      // 监听消息事件 默认message
      event: 'message',
      // 优先级
      priority: 5000,
      // 以下rule、task、button、handler均为可选，如键入，则必须为数组
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(系统)?日志',
          /** 执行方法 */
          fnc: 'log',
          //  是否显示操作日志 true=是 false=否
          log: true,
          // 权限 master,owner,admin,all
          permission: 'master'
        }
      ]
    })
  }

  async log() {
    if (!this.e.isPrivate && !config.Config.logInGroup) {
      this.reply('请私聊发送')
      return
    }

    const msg = this.e.msg
    const number = RegExp(/\d+/).exec(msg) || [20]
    let level = ''
    if (containsAny(msg, ['信息', 'INFO'])) {
      level = 'INFO'
    } else if (containsAny(msg, ['警告', 'WARN'])) {
      level = 'WARN'
    } else if (containsAny(msg, ['错误', '异常', 'ERROR'])) {
      level = 'ERRO'
    } else if (containsAny(msg, ['标记', 'mark'])) {
      level = 'MARK'
    } else if (containsAny(msg, ['追踪', 'trace'])) {
      level = 'TRACE'
    } else if (containsAny(msg, ['调试', 'debug'])) {
      level = 'DEBU'
    }

    try {
      const filePath = dirname
      const vue = fs.readFileSync(`${filePath}/resources/template/Logs.vue`, 'utf8')
      const logs = getLogs(number[0], level)
      // FIXME: 等待上游Renderer函数适配vue
      const img = await Renderer.render({
        name: 'Log',
        data: logs,
        vue: vue,
        setViewport: { width: 640 },
        file: ''
      }) as string
      return this.reply(segment.image(img))
    } catch (error) {
      logger.error(error)
      if (error instanceof ReferenceError) {
        return this.reply(error.message)
      }
    }
  }
}

function containsAny(str:string, substrings:string[]) {
  return substrings.some(substring =>
    str.toLowerCase().includes(substring.toLowerCase())
  )
}
