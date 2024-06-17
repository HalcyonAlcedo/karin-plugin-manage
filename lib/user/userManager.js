import { YamlEditor, redis as db } from '#Karin'
import { Config } from '#Plugin'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Yaml from 'yaml'
import fs from 'fs'

function md5(data) {
  return crypto.createHash('md5').update(data).digest('hex')
}

class UserManager {
  constructor() {
    this.tokenTTLs = []
    this.tokens = []
    this.init()
  }

  async init() {
    this.users = this.loadUsersFromYAML();
    this.secretKey = await this.getSecretKey()
  }

  // 从YAML文件加载用户信息
  loadUsersFromYAML() {
    // 初始化用户配置
    if (!fs.existsSync('data/karin-plugin-manage/user.yaml')) {
      // 迁移旧版本数据
      try {
        let oldData = Config.getConfig('user')
        fs.writeFileSync('data/karin-plugin-manage/user.yaml', Yaml.stringify(oldData), 'utf8')
      } catch (err) {
        fs.writeFileSync('data/karin-plugin-manage/user.yaml', '', 'utf8')
      }
    }
    const yamlEditor = new YamlEditor('data/karin-plugin-manage/user.yaml')
    const data = yamlEditor.get() || [];
    return data
  }

  tempYaml() {
    if (!fs.existsSync('data/karin-plugin-manage/temp.yaml')) {
      fs.writeFileSync('data/karin-plugin-manage/temp.yaml', '', 'utf8')
    }
    return new YamlEditor('data/karin-plugin-manage/temp.yaml')
  }

  // 添加用户
  addUser(username, password, routes) {
    if (this.checkUser(username)) return
    const hashedPassword = bcrypt.hashSync(md5(password), 10);
    const newUser = {
      username,
      password: hashedPassword,
      routes,
      status: 'enabled' // 默认启用账号
    };
    this.users.push(newUser);
    this.saveUserToYAML(newUser);
  }

  // 将用户信息保存到YAML文件
  saveUserToYAML(newUser) {
    const yamlEditor = new YamlEditor('data/karin-plugin-manage/user.yaml')
    yamlEditor.pusharr(newUser)
    yamlEditor.save()
  }

  // 修改用户信息到YAML文件
  saveUserDataToYAML(user, key, value) {
    if (!this.checkUser(user)) return
    const yamlEditor = new YamlEditor('data/karin-plugin-manage/user.yaml')
    let current = yamlEditor.document.contents
    for (let i in current.items) {
      let target
      for (let l in current.items[i].items) {
        if (current.items[i].items[l].key.value === 'username' && current.items[i].items[l].value.value === user) {
          target = true
        }
        if (current.items[i].items[l].key.value === key && target) {
          if (typeof value === "string") {
            current.items[i].items[l].value.value = value
          } else {
            const yamlSeq = new Yaml.YAMLSeq()
            value.forEach(element => {
              yamlSeq.add(element);
            })
            current.items[i].items[l].value = yamlSeq
          }
        }
      }
    }
    yamlEditor.save()
  }

  // 检查用户是否存在
  checkUser(username) {
    const user = this.users.find(u => u.username === username)
    return user ? true : false
  }

  // 系统登录接口
  async login(username, password, remember) {
    const user = this.users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return null;
    }

    const token = jwt.sign({ username, routes: user.routes }, this.secretKey, { expiresIn: '1h' });
    await this.setToken(username, token, remember)
    const tokenExpiry = new Date(new Date().getTime() + 60 * 60 * 1000);
    return { token, tokenExpiry, routes: user.routes };
  }

  // 系统快速登录接口
  async quickLogin(otp, username) {
    const auth = await this.getOtp()
    if (otp != auth) {
      return null;
    }
    const user = this.users.find(u => u.username === username);
    const token = jwt.sign({ username, routes: user.routes }, this.secretKey, { expiresIn: '1h' });
    await this.setToken(username, token)
    await this.delOtp()
    const tokenExpiry = new Date(new Date().getTime() + 60 * 60 * 1000);
    return { token, tokenExpiry, routes: user.routes };
  }

  // 注销接口
  async logout(username, token) {
    const currentToken = await this.getToken(username);
    if (token === currentToken) {
      return await this.delToken(username);
    }
    return false
  }

  // 验证密码
  async validatePassword(username, password) {
    const user = this.users.find(u => u.username === username)
    if (user) {
      return bcrypt.compareSync(password, user.password)
    }
    return false
  }

  // 修改密码
  async changePassword(username, password) {
    const user = this.users.find(u => u.username === username)
    if (user) {
      const hashedNewPassword = bcrypt.hashSync(password, 10)
      user.password = hashedNewPassword
      // 修改配置文件
      this.saveUserDataToYAML(username, 'password', hashedNewPassword)
      return true
    }
    return false
  }

  // 更新用户权限
  async changePermissions(username, perm) {
    // 查找用户并更新权限
    const user = this.users.find(u => u.username === username)
    if (!user) {
      throw new Error('User not found');
    }
    // 更新用户权限
    user.routes = perm;
    // 修改配置文件
    this.saveUserDataToYAML(username, 'routes', perm)
    return true
  }

  // 更新token过期时间
  async refreshToken(username, token) {
    const currentToken = await this.getToken(username);
    if (token === currentToken) {
      await this.expireToken(username); // 更新token的过期时间
    }
  }

  // 设置otp
  async setOtp(otp, ttl) {
    try {
      // 尝试从数据库获取
      await db.set(`karin-plugin-manage:user:otp`, otp, { EX: ttl })
    } catch (error) {
      // 写入运行缓存
      if (this.OtpTTL) {
        clearInterval(this.OtpTTL)
        this.OtpTTL = null
      }
      this.Otp = otp
      this.OtpTTL = setInterval(() => {
        this.Otp = null
      }, ttl * 1000)
    }
  }

  // 获取otp
  async getOtp() {
    try {
      return await db.get(`karin-plugin-manage:user:otp`)
    } catch (error) {
      return this.Otp || null
    }
  }

  // 删除otp
  async delOtp() {
    try {
      await db.del(`karin-plugin-manage:user:otp`)
    } catch (error) {
      if (this.OtpTTL) {
        clearInterval(this.OtpTTL)
        this.OtpTTL = null
      }
      this.Otp = null
    }
  }

  // 设置Token
  async setToken(username, token, remember) {
    try {
      await db.set(`karin-plugin-manage:user:${username}:token`, token, remember ? { EX: 60 * 60 } : undefined)
    } catch (error) {
      const tempData = this.tempYaml()
      if (this.tokenTTLs[username]) {
        clearInterval(this.tokenTTLs[username])
        this.tokenTTLs.splice(username, 1)
      }
      this.tokens[username] = token
      tempData.set(`tokens.${username}`, token)
      tempData.save()
      if (remember) {
        this.tokenTTLs[username] = setInterval(() => {
          this.tokens.splice(username, 1)
          const tempData = this.tempYaml()
          tempData.del(`tokens.${username}`)
          tempData.save()
        }, 1000 * 60 * 60)
      }
    }
  }

  // 获取Token
  async getToken(username) {
    try {
      return await db.get(`karin-plugin-manage:user:${username}:token`)
    } catch (error) {
      const tempData = this.tempYaml()
      if (!this.tokens[username]) {
        this.tokens[username] = tempData.get(`tokens.${username}`)
      }
      return this.tokens[username] || undefined
    }
  }

  // 删除Token
  async delToken(username) {
    try {
      await db.del(`karin-plugin-manage:user:${username}:token`)
    } catch (error) {
      if (this.tokenTTLs[username]) {
        clearInterval(this.tokenTTLs[username])
        this.tokenTTLs.splice(username, 1)
      }
      this.tokens.splice(username, 1)
      const tempData = this.tempYaml()
      tempData.del(`tokens.${username}`)
      tempData.save()
    }
  }

  // 更新Token过期时间
  async expireToken(username) {
    try {
      await db.expire(`karin-plugin-manage:user:${username}:token`, 60 * 60)
    } catch (error) {
      if (this.tokenTTLs[username]) {
        clearInterval(this.tokenTTLs[username])
        this.tokenTTLs[username] = setInterval(() => {
          this.tokens.splice(username, 1)
          const tempData = this.tempYaml()
          tempData.del(`tokens.${username}`)
          tempData.save()
        }, 1000 * 60 * 60)
      }
    }
  }

  // 获取secretKey
  async getSecretKey() {
    const tempData = this.tempYaml()
    let secretKey
    try {
      secretKey = await db.get(`karin-plugin-manage:secretKey`)
    } catch (error) {
      secretKey = tempData.get('secretKey')
    }
    if (!secretKey) {
      secretKey = crypto.randomBytes(64).toString('hex')
      try {
        await db.set('karin-plugin-manage:secretKey', secretKey)
      } catch (error) {
        tempData.set('secretKey', secretKey)
        tempData.save()
      }
    }
    return secretKey
  }
}

export default new UserManager()
