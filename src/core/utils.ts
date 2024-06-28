import { publicIp } from 'public-ip'
import crypto from 'crypto'

/**
 * 将字符串的中间部分使用省略号省略
 * @param {string} str 要处理的字符串
 * @returns {string} 处理后的字符串
 */
export function ellipsisMiddle(str: string): string {
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
export async function getPublicIp(): Promise<string> {
  return await publicIp()
}

/**
 * 计算字符串的MD5值
 * @param {string} str 要处理的字符串
 * @returns {string} 计算后的MD5值
 */
export function md5(str:string):string {
  return crypto.createHash('md5').update(str).digest('hex')
}
