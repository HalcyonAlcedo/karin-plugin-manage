import fs from 'fs';
import { Renderer, segment, logger, karin } from 'node-karin';
import { dirname, config } from '../imports/index.js';
import { getLogs } from '../core/system/index.js';
export const log = karin.command(/^#(系统)?日志/, async (e) => {
    if (!e.isPrivate && !config.Config.logInGroup) {
        return e.reply('请私聊发送') !== undefined;
    }
    // 获取多少条日志
    const number = RegExp(/\d+/).exec(e.msg) || [20];
    // 获取日志等级
    let level = '';
    if (containsAny(e.msg, ['信息', 'INFO'])) {
        level = 'INFO';
    }
    else if (containsAny(e.msg, ['警告', 'WARN'])) {
        level = 'WARN';
    }
    else if (containsAny(e.msg, ['错误', '异常', 'ERROR'])) {
        level = 'ERRO';
    }
    else if (containsAny(e.msg, ['标记', 'mark'])) {
        level = 'MARK';
    }
    else if (containsAny(e.msg, ['追踪', 'trace'])) {
        level = 'TRACE';
    }
    else if (containsAny(e.msg, ['调试', 'debug'])) {
        level = 'DEBU';
    }
    try {
        const filePath = dirname;
        const vue = fs.readFileSync(`${filePath}/resources/template/Logs.vue`, 'utf8');
        const logs = getLogs(number[0], level);
        const img = await Renderer.render({
            name: 'Log',
            file: vue,
            props: logs,
            vue: true,
            setViewport: { width: 640 }
        });
        return e.reply(segment.image(img)) !== undefined;
    }
    catch (error) {
        logger.error(error);
        if (error instanceof ReferenceError) {
            return e.reply(error.message) !== undefined;
        }
        else
            return false;
    }
}, { permission: 'master' });
/**
 * 字符串中是否包含指定字符
 * @param {string} str
 * @param {string[]} substrings
 * @returns {boolean}
 */
function containsAny(str, substrings) {
    return substrings.some(substring => str.toLowerCase().includes(substring.toLowerCase()));
}
