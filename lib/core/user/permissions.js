import fs from 'fs'
import { YamlEditor, redis as db } from 'node-karin'
class Permissions {
  tokenTTL
  token
  secretKey
  OtpTTL
  Otp
  username
  constructor (username, secretKey) {
    this.username = username
    this.secretKey = secretKey
    this.getToken()
  }

  tempYaml () {
    if (!fs.existsSync('data/karin-plugin-manage/temp.yaml')) {
      fs.writeFileSync('data/karin-plugin-manage/temp.yaml', '', 'utf8')
    }
    return new YamlEditor('data/karin-plugin-manage/temp.yaml')
  }

  /**
    * 设置otp
    * @param {string} otp 验证码
    */
  async setOtp (otp) {
    try {
      // 尝试从数据库获取
      await db.set(`karin-plugin-manage:user:${this.username}:otp`, otp, { EX: 180 })
    } catch (error) {
      // 写入运行缓存
      if (this.OtpTTL) {
        clearInterval(this.OtpTTL)
        this.OtpTTL = null
      }
      this.Otp = otp
      this.OtpTTL = setInterval(() => {
        this.Otp = null
      }, 180 * 1000)
    }
  }

  /**
    * 获取otp
    * @returns {boolean} 验证码
    */
  async getOtp () {
    try {
      return await db.get(`karin-plugin-manage:user:${this.username}:otp`)
    } catch (error) {
      return this.Otp || null
    }
  }

  /**
    * 删除otp
    */
  async delOtp () {
    try {
      await db.del(`karin-plugin-manage:user:${this.username}:otp`)
    } catch (error) {
      if (this.OtpTTL) {
        clearInterval(this.OtpTTL)
        this.OtpTTL = null
      }
      this.Otp = null
    }
  }

  /**
    * 设置Token
    * @param {string} token Token
    * @param {boolean} remember 是否记住登陆状态
    */
  async setToken (token, remember) {
    try {
      await db.set(`karin-plugin-manage:user:${this.username}:token`, token, remember ? undefined : { EX: 60 * 60 })
    } catch (error) {
      const tempData = this.tempYaml()
      clearInterval(this.tokenTTL)
      this.token = token
      tempData.set(`tokens.${this.username}`, token)
      tempData.save()
      if (!remember) {
        this.tokenTTL = setInterval(() => {
          this.token = null
          const tempData = this.tempYaml()
          tempData.del(`tokens.${this.username}`)
          tempData.save()
        }, 1000 * 60 * 60)
      }
    }
  }

  /**
     * 获取Token
     * @returns {string | null} Token
     */
  async getToken () {
    try {
      return await db.get(`karin-plugin-manage:user:${this.username}:token`)
    } catch (error) {
      const tempData = this.tempYaml()
      if (!this.token) {
        this.token = tempData.get(`tokens.${this.username}`)
      }
      return this.token || null
    }
  }

  /**
     * 删除Token
     */
  async delToken () {
    try {
      await db.del(`karin-plugin-manage:user:${this.username}:token`)
    } catch (error) {
      if (this.tokenTTL) {
        clearInterval(this.tokenTTL)
      }
      this.token = null
      const tempData = this.tempYaml()
      tempData.del(`tokens.${this.username}`)
      tempData.save()
    }
  }

  /**
     * 更新Token过期时间
     */
  async expireToken () {
    try {
      await db.expire(`karin-plugin-manage:user:${this.username}:token`, 60 * 60)
    } catch (error) {
      if (this.tokenTTL) {
        clearInterval(this.tokenTTL)
        this.tokenTTL = setInterval(() => {
          this.token = null
          const tempData = this.tempYaml()
          tempData.del(`tokens.${this.username}`)
          tempData.save()
        }, 1000 * 60 * 60)
      }
    }
  }
}
export default Permissions
