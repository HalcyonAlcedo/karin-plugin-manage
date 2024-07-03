import { KarinRenderApp } from 'node-karin';
interface Log {
    timestamp: string;
    level: string;
    message: string;
}
interface Records {
    number: number;
    index: number;
}
/**
* 获取RenderApp列表
* @returns {Promise<KarinRenderApp[]>} RenderApp列表
*/
export declare function getRendererList(): Promise<KarinRenderApp[]>;
/**
* 查询日志
* @param {number | string | number[] | Records | null} numRecords 查询参数
* @param {string} filterLevel 日志等级
* @param {string} lastTimestamp 查询时间
* @returns {Log[]} 日志列表
*/
export declare function getLogs(numRecords: number | string | number[] | Records | null, filterLevel?: string, lastTimestamp?: string): Log[];
export {};
