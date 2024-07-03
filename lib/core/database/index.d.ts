interface Data {
    currentPage: number;
    totalPages: number;
    total: number;
    data: any;
}
/**
* 查询数据库数据
* @param {string} pattern 查询参数
* @param {string} pattern 查询参数
* @param {string} pattern 查询参数
* @returns {Data} 配置信息
*/
export declare function searchData(pattern: string, page: number, count: number): Promise<Data>;
export {};
