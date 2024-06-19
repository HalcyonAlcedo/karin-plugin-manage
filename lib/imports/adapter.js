import { Bot } from '#Karin'

const getBots = (uid) => {
  if (!uid) {
    const list = {}
    Bot.getBotAll().forEach(bot => {
      list[bot.account.uid] = bot
    })
    return list
  }
  return Bot.getBot(uid)
}

export { getBots }
