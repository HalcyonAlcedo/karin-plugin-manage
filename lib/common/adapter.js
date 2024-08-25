import { karin } from 'node-karin';
export function getBots() {
    const list = {};
    const botList = karin.getBotAll();
    for (const bot of botList) {
        list[bot.account.uid] = bot;
    }
    return list;
}
