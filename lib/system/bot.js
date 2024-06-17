import { Bot } from '#Karin'

const getBotList = async () => {
  let list = []
  let bots = Bot.list
  if (bots === undefined) {
    bots = []
    for(const k in Bot.adapter) {
      bots.push(Bot.adapter[k])
    }
  } else {
    bots = bots.map(obj => obj.bot)
  }
  for (const bot of bots) {
    if (bot.socket && bot.socket.readyState !== 1) continue
    const avatar = bot.getAvatarUrl() || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${k}`
    const friends = await bot.GetFriendList()
    const groups = await bot.GetGroupList()
    list.push({
      uin: bot.account.uid,
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
  return list
}

export {
  getBotList
}


