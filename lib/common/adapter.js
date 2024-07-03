import { Bot } from 'node-karin';
export function getBots() {
    const list = {};
    const botList = Bot.getBotAll();
    for (const bot of botList) {
        list[bot.account.uid] = bot;
    }
    return list;
}
