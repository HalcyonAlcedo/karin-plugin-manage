import { Renderer } from 'node-karin';
import fs from 'fs';
import path from 'path';
function parseLogData(logData, numRecords = null, filterLevel = '', lastTimestamp = '') {
    const ansiEscapeRegex = /\x1B\[[0-?]*[ -/]*[@-~]/g;
    const logRegex = /(\[\d{2}:\d{2}:\d{2}\.\d{3}\])\[(\w+)\] (.+?)(?=\[\d{2}:\d{2}:\d{2}\.\d{3}\]\[\w+\] |$)/gs;
    logData = logData.replace(ansiEscapeRegex, '');
    const records = [];
    let match;
    const cleanLastTimestamp = lastTimestamp.replace(/[\[\]]/g, '');
    const lastTimeValue = cleanLastTimestamp ? new Date('1970-01-01T' + cleanLastTimestamp + 'Z').getTime() : null;
    while ((match = logRegex.exec(logData)) !== null) {
        const timestamp = match[1];
        const level = match[2];
        const message = match[3].trim();
        const cleanTimestamp = timestamp.replace(/[\[\]]/g, '');
        const timeValue = cleanTimestamp ? new Date('1970-01-01T' + cleanTimestamp + 'Z').getTime() : null;
        if (numRecords && numRecords >= 0) {
            if (lastTimeValue && timeValue && timeValue < lastTimeValue) {
                continue;
            }
        }
        else if (lastTimeValue && timeValue && timeValue >= lastTimeValue) {
            continue;
        }
        if (filterLevel && level !== filterLevel) {
            continue;
        }
        records.push({
            timestamp,
            level,
            message
        });
    }
    records.reverse();
    if (numRecords === null) {
        return records;
    }
    if (typeof numRecords === 'string') {
        numRecords = Number(numRecords);
    }
    if (typeof numRecords === 'number') {
        if (numRecords >= 0) {
            return records.slice(0, numRecords);
        }
        else {
            return records.slice(0, -numRecords);
        }
    }
    if (Array.isArray(numRecords) && numRecords.length === 2) {
        return records.slice(numRecords[0], numRecords[1]);
    }
    if (numRecords) {
        const { number, index } = numRecords;
        return records.slice(index, number);
    }
    return records;
}
/**
* 获取RenderApp列表
* @returns {Promise<KarinRenderApp[]>} RenderApp列表
*/
export async function getRendererList() {
    return Renderer.Apps;
}
/**
* 查询日志
* @param {number | string | number[] | Records | null} numRecords 查询参数
* @param {string} filterLevel 日志等级
* @param {string} lastTimestamp 查询时间
* @returns {Log[]} 日志列表
*/
export function getLogs(numRecords, filterLevel = 'ALL', lastTimestamp = '') {
    const logsDir = path.resolve('logs/');
    const files = fs.readdirSync(logsDir);
    const logFileRegex = /logger\.\d{4}-\d{2}-\d{2}\.log$/;
    const sortedFiles = files.filter(file => logFileRegex.test(file)).sort((a, b) => a.localeCompare(b)).reverse();
    const latestLogFile = sortedFiles[0];
    if (latestLogFile) {
        const latestLogPath = path.join(logsDir, latestLogFile);
        const data = fs.readFileSync(latestLogPath, 'utf8');
        if (filterLevel === 'ALL') {
            filterLevel = '';
        }
        return parseLogData(data, numRecords, filterLevel, lastTimestamp);
    }
    else {
        throw new Error('没有找到日志文件。');
    }
}
