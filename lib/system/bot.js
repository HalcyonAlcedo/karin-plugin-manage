import { getBots } from '#Plugin'

const getBotList = async () => {
  let list = []
  for (const k in getBots()) {
    const bot = getBots(k)
    if (bot.socket && bot.socket.readyState !== 1) continue
    const avatar = bot.getAvatarUrl() || `https://q1.qlogo.cn/g?b=qq&s=0&nk=${k}`
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
  return list
}

export {
  getBotList
}


