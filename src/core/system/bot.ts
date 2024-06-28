import { getBots } from '../../imports/adapter'
import { Bot, KarinAdapter } from '../../../../../src/index'

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

const getBotList = async () => {
  let list: BotList[] = []
  for (const k in getBots()) {
    const bot: KarinAdapter | undefined = Bot.getBot(k)
    if (bot) {
      if (bot?.socket && bot?.socket?.readyState !== 1) continue
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
    }
  }
  return list
}

export {
  getBotList
}


