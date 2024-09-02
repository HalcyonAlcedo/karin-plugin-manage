declare class Common {
    /**
     * 生成随机数
     * @param min - 最小值
     * @param max - 最大值
     * @returns
     */
    random(min: number, max: number): number;
    /**
     * 睡眠函数
     * @param ms - 毫秒
     */
    sleep(ms: number | undefined): Promise<unknown>;
    /**
     * 使用moment返回时间
     * @param format - 格式
     */
    time(format?: string): string;
    /**
     * 将字符串的中间部分使用省略号省略
     * @param {string} str 要处理的字符串
     * @returns {string} 处理后的字符串
     */
    ellipsisMiddle(str: string): string;
    /**
     * 获取公网ip
     * @returns {string} ip
     */
    getPublicIp(): Promise<string>;
    /**
     * 计算字符串的MD5值
     * @param {string} str 要处理的字符串
     * @returns {string} 计算后的MD5值
     */
    md5(str: string): string;
}
export declare const common: Common;
export {};
