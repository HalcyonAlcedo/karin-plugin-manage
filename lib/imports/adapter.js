import { Bot } from '#Karin'

const getBots = (uid) => {
  let bots = []
  if (Bot.list === undefined) {
    if (uid) {
      return Bot.adapter[uid]
    }
    for(const k in Bot.adapter) {
      bots[k] = Bot.adapter[k]
    }
  } else {
    if (uid) {
      return Bot.list.find(item => item.bot?.account?.uid === parseInt(uid)).bot
    }
    for(const bot of Bot.list.map(obj => obj.bot)) {
      bots[bot.account.uid] = bot
    }
  }
  return bots
}

export { getBots }
