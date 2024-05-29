import { redis } from '#Karin'

const searchData = async (pattern, page, count) => {
  let cursor = '0';
  let totalKeys = 0;
  let totalPages = 0;
  let allMatchedKeys = [];

  // 获取所有匹配的键
  do {
    const reply = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = reply.cursor;
    // 筛选匹配模式的键
    const regexPattern = '^' + pattern.replace(/\*/g, '.*') + '$';
    const regex = new RegExp(regexPattern);
    const matchedKeys = reply.keys.filter(key => regex.test(key));
    allMatchedKeys.push(...matchedKeys);
  } while (cursor !== 0);

  totalKeys = allMatchedKeys.length;
  totalPages = Math.ceil(totalKeys / count);

  // 获取当前页的数据
  const currentPageKeys = allMatchedKeys.slice((page - 1) * count, page * count);

  // 获取当前页的键的类型、TTL和值
  const results = [];
  for (const key of currentPageKeys) {
    const type = await redis.type(key);
    const ttl = await redis.ttl(key);
    const value = await redis.get(key);
    results.push({ key, type, ttl, value });
  }

  return {
    currentPage: page,
    totalPages: totalPages,
    total: totalKeys,
    data: results
  };
}

export {
  searchData
}


