import { Bot, KarinAdapter } from '../../../../src/index'

interface DynamicObject {
  [key: string]: KarinAdapter
}

export function getBots(): DynamicObject {
    const list: DynamicObject = {}
    Bot.getBotAll().forEach(bot => {
      list[bot.account.uid] = bot
    })
    return list
}
