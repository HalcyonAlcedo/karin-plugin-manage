import { YamlEditor, redis } from '#Karin'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Yaml from 'yaml'
import Cfg from '../config.js'

function md5(data) {
  return crypto.createHash('md5').update(data).digest('hex')
}

class UserManager {
  constructor() {
    this.users = this.loadUsersFromYAML(); // 从YAML文件加载用户信息
  }

  // 从YAML文件加载用户信息
  loadUsersFromYAML() {
    const data = Cfg.getConfig('user') || [];
    return data;
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
    const yamlEditor = new YamlEditor('plugins/karin-plugin-manage/config/config/user.yaml')
    let current = yamlEditor.document.contents
    current.add(newUser)
    yamlEditor.save()
  }

  // 修改用户信息到YAML文件
  saveUserDataToYAML(user, key, value) {
    if (!this.checkUser(user)) return
    const yamlEditor = new YamlEditor('plugins/karin-plugin-manage/config/config/user.yaml')
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
    if (user) {
      return true
    }
    return false
  }

  // 系统登录接口
  async login(username, password) {
    const user = this.users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return null;
    }

    let secretKey = Cfg.getConfig('server').secretKey
    // 添加secretKey配置
    if (!secretKey) {
      secretKey = crypto.randomBytes(64).toString('hex')
      const yamlEditor = new YamlEditor('plugins/karin-plugin-manage/config/config/server.yaml')
      yamlEditor.set('secretKey', secretKey)
      yamlEditor.save()
    }
    const token = jwt.sign({ username, routes: user.routes }, secretKey, { expiresIn: '1h' });
    await redis.set(`karin-plugin-manage:user:${username}:token`, token, { EX: 60 * 60 }); // 存储token到Redis，1小时后过期
    const tokenExpiry = new Date(new Date().getTime() + 60 * 60 * 1000); // 设置1小时后过期
    return { token, tokenExpiry, routes: user.routes };
  }

  // 系统快速登录接口
  async quickLogin(otp, username) {
    const auth = await redis.get(`karin-plugin-manage:user:otp`)
    if (otp != auth) {
      return null;
    }
    const user = this.users.find(u => u.username === username);
    let secretKey = Cfg.getConfig('server').secretKey
    // 添加secretKey配置
    if (!secretKey) {
      secretKey = crypto.randomBytes(64).toString('hex')
      const yamlEditor = new YamlEditor('plugins/karin-plugin-manage/config/config/server.yaml')
      yamlEditor.set('secretKey', secretKey)
      yamlEditor.save()
    }
    const token = jwt.sign({ username, routes: user.routes }, secretKey, { expiresIn: '1h' });
    await redis.set(`karin-plugin-manage:user:${username}:token`, token, { EX: 60 * 60 }); // 存储token到Redis，1小时后过期
    await redis.del(`karin-plugin-manage:user:otp`)
    const tokenExpiry = new Date(new Date().getTime() + 60 * 60 * 1000); // 设置1小时后过期
    return { token, tokenExpiry, routes: user.routes };
  }

  // 注销接口
  async logout(username, token) {
    const currentToken = await redis.get(`karin-plugin-manage:user:${username}:token`);
    if (token === currentToken) {
      return await redis.del(`karin-plugin-manage:user:${username}:token`);
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
    const currentToken = await redis.get(`karin-plugin-manage:user:${username}:token`);
    if (token === currentToken) {
      await redis.expire(`karin-plugin-manage:user:${username}:token`, 60 * 60); // 更新Redis中token的过期时间
    }
  }
}

export default new UserManager()
