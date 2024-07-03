import { Bot, KarinAdapter } from 'node-karin'

interface DynamicObject {
  [key: string]: KarinAdapter
}

export function getBots(): DynamicObject {
  const list: DynamicObject = {}
  const botList = Bot.getBotAll() as KarinAdapter[]
  for (const bot of botList) {
    list[bot.account.uid] = bot
  }
  return list
}
