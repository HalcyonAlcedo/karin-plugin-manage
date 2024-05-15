import { plugin } from '#Karin'
import crypto from 'crypto'
import { UserManager } from '../lib/user/index.js'
import server from '../lib/server/index.js'

// 启动面板api
server()

export class Server extends plugin {
  constructor () {
    super({
      // 必选 插件名称
      name: 'ManageServer',
      // 插件描述
      dsc: '管理面板服务',
      // 监听消息事件 默认message
      event: 'message',
      // 优先级
      priority: 5000,
      // 以下rule、task、button、handler均为可选，如键入，则必须为数组
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#添加面板管理账号',
          /** 执行方法 */
          fnc: 'addAdminUser',
          //  是否显示操作日志 true=是 false=否
          log: true,
          // 权限 master,owner,admin,all
          permission: 'master'
        },
        {
          /** 命令正则匹配 */
          reg: '^#重置面板管理密码',
          /** 执行方法 */
          fnc: 'changePassword',
          //  是否显示操作日志 true=是 false=否
          log: true,
          // 权限 master,owner,admin,all
          permission: 'master'
        }
      ]
    })
  }

  async addAdminUser () {
    if (!this.e.isPrivate) {
      this.reply('只允许私聊发送')
    }

    let msg = this.e.msg
    let password = msg.replace(/^#添加面板管理账号/, '').replace(/[\s\r\n]+/g, '')

    if (UserManager.checkUser(this.e.user_id)) {
      if (password) {
        this.reply(`检测到账号${this.e.user_id}已存在，密码修改为${password}`)
      } else {
        this.reply(`检测到账号${this.e.user_id}已存在，你可以回复[#重置面板管理密码 passwoed]进行密码重置`)
      }
    } else {
      if (!password) {
        password = crypto.randomBytes(32).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
      }
      UserManager.addUser(this.e.user_id, password)
      this.reply(`已创建账号\n用户名：${this.e.user_id}\n密码：${password}`)
    }
  }
  async changePassword () {
    if (!this.e.isPrivate) {
      this.reply('只允许私聊发送')
    }

    let msg = this.e.msg
    let password = msg.replace(/^#重置面板管理密码/, '').replace(/[\s\r\n]+/g, '')

    if (UserManager.checkUser(this.e.user_id)) {
      if (password) {
        this.reply(`密码修改成功`)
      } else {
        this.reply(`命令错误，正确的格式为[#重置面板管理密码 passwoed]`)
      }
    } else {
      this.reply('账号不存在，如需创建账号请回复[#添加面板管理账号 密码]')
    }
  }
}
