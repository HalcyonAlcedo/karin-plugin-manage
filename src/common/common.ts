import { publicIp } from 'public-ip'
import crypto from 'crypto'
import { lodash, moment } from 'node-karin/modules.js'

class Common {
  /**
   * 生成随机数
   * @param min - 最小值
   * @param max - 最大值
   * @returns
   */
  random(min: number, max: number) {
    return lodash.random(min, max)
  }

  /**
   * 睡眠函数
   * @param ms - 毫秒
   */
  sleep(ms: number | undefined) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 使用moment返回时间
   * @param format - 格式
   */
  time(format = 'YYYY-MM-DD HH:mm:ss') {
    return moment().format(format)
  }

  /**
   * 将字符串的中间部分使用省略号省略
   * @param {string} str 要处理的字符串
   * @returns {string} 处理后的字符串
   */
  ellipsisMiddle(str: string): string {
    if (str.length < 6) {
      // 字符串长度小于6位，直接返回原字符串
      return str
    }
    const maxLength: number = Math.floor(str.length * 0.6)
    const leftPartLength: number = Math.ceil(maxLength / 2)
    const rightPartLength: number = maxLength - leftPartLength
    const leftPart: string = str.slice(0, leftPartLength)
    const rightPart: string = str.slice(-rightPartLength)
    return leftPart + '...' + rightPart
  }
  /**
   * 获取公网ip
   * @returns {string} ip
   */
  async getPublicIp(): Promise<string> {
    const ip = await publicIp({
      timeout:500,
      fallbackUrls: [
        'https://ifconfig.co/ip'
      ]
    })
    return ip || '0.0.0.0'
  }

  /**
   * 计算字符串的MD5值
   * @param {string} str 要处理的字符串
   * @returns {string} 计算后的MD5值
   */
  md5(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex')
  }
}

export const common = new Common()
