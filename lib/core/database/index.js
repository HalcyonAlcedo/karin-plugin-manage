import { redis as db } from 'node-karin';
import { config } from '../../imports/index.js';
/**
* 查询数据库数据
* @param {string} pattern 查询参数
* @param {string} pattern 查询参数
* @param {string} pattern 查询参数
* @returns {Data} 配置信息
*/
export async function searchData(pattern, page, count) {
    let allKeys = [];
    let totalKeys = 0;
    let totalPages = 0;
    const redisMode = config.Config.redis && db.scan;
    if (redisMode) {
        let cursor = 0;
        // 获取所有匹配的键
        do {
            const reply = await db.scan(cursor, { MATCH: pattern, COUNT: 100 });
            cursor = reply.cursor;
            // 筛选匹配模式的键
            const regexPattern = '^' + pattern.replace(/\*/g, '.*') + '$';
            const regex = new RegExp(regexPattern);
            const matchedKeys = reply.keys.filter((key) => regex.test(key));
            allKeys.push(...matchedKeys);
        } while (cursor !== 0);
        totalKeys = allKeys.length;
        totalPages = Math.ceil(totalKeys / count);
    }
    else {
        // 使用keys命令获取所有匹配的键
        allKeys = await db.keys(pattern);
        totalKeys = allKeys.length;
        totalPages = Math.ceil(totalKeys / count);
    }
    // 获取当前页的数据
    const currentPageKeys = allKeys.slice((page - 1) * count, page * count);
    // 获取当前页的键的类型、TTL和值
    const results = await Promise.all(currentPageKeys.map(async (key) => {
        const type = redisMode ? await db.type(key) : 'string';
        const ttl = await db.ttl(key);
        const value = await db.get(key);
        return { key, type, ttl, value };
    }));
    return {
        currentPage: page,
        totalPages: totalPages,
        total: totalKeys,
        data: results
    };
}
