import { KarinAdapter } from 'node-karin';
interface BotList {
    uin: string;
    avatar: string;
    conut: {
        friend: number;
        group: number;
    };
    version: KarinAdapter["version"];
    account: KarinAdapter["account"];
    adapter: KarinAdapter["adapter"];
}
/**
* 获取bot列表
* @returns {BotList[]} bot列表
*/
export declare function getBotList(): Promise<BotList[]>;
export {};
