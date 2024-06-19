/**
 * 将字符串的中间部分使用省略号省略
 * @param {string} str 要处理的字符串
 * @returns {string} 处理后的字符串
 */
export function ellipsisMiddle(str) {
  if (typeof str !== 'string') {
    str = str.toString()
  }
  if (str.length < 6) {
      // 字符串长度小于6位，直接返回原字符串
      return str;
  }

  const maxLength = Math.floor(str.length * 0.6);
  const leftPartLength = Math.ceil(maxLength / 2);
  const rightPartLength = maxLength - leftPartLength;

  const leftPart = str.slice(0, leftPartLength);
  const rightPart = str.slice(-rightPartLength);

  return leftPart + '...' + rightPart;
}
