import { getBots } from '@plugin/imports'
import { karin, KarinAdapter } from 'node-karin'

interface BotList {
  uin: string
  avatar: string
  conut: {
    friend: number
    group: number
  }
  version: KarinAdapter["version"]
  account: KarinAdapter["account"]
  adapter: KarinAdapter["adapter"]
}

/**
* 获取bot列表
* @returns {BotList[]} bot列表
*/
export async function getBotList() {
  let list: BotList[] = []
  for (const k in getBots()) {
    const bot: KarinAdapter | undefined = karin.getBot(k)
    if (bot) {
      try {
        const avatar = bot.getAvatarUrl(k) || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${k}`
        const friends = await bot.GetFriendList()
        const groups = await bot.GetGroupList()
        list.push({
          uin: k,
          avatar: avatar,
          conut: {
            friend: friends.length,
            group: groups.length
          },
          version: bot.version,
          account: bot.account,
          adapter: bot.adapter
        })
      } catch (_error) {
        // 错误的Adapter无需处理
      }
    }
  }
  return list
}
