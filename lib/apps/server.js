import crypto from 'crypto';
import { segment, karin } from 'node-karin';
import { common, config } from '../imports/index.js';
import { UserManager } from '../core/user/index.js';
import { start, restart } from '../server/index.js';
// 启动面板api
start();
// 创建面板管理账号
export const addUser = karin.command(/^#(添加|创建)面板(管理)账号/, async (e) => {
    // 判断是否群聊
    if (!e.isPrivate) {
        return e.reply('请私聊发送') !== undefined;
    }
    // 获取消息中的密码
    let password = e.msg.replace(/^#(添加|创建)面板(管理)账号/, '').replace(/\s+/g, '');
    // 检查账号状态
    if (UserManager.checkUser(e.user_id)) {
        if (password) {
            UserManager.changePassword(e.user_id, crypto.createHash('md5').update(password).digest('hex'));
            return e.reply(`检测到账号${e.user_id}已存在，密码修改为${password}`) !== undefined;
        }
        else {
            return e.reply(`检测到账号${e.user_id}已存在，你可以回复[#重置面板管理密码 passwoed]进行密码重置`) !== undefined;
        }
    }
    else {
        if (!password) {
            password = crypto.randomBytes(32).toString().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
        }
        UserManager.addUser(e.user_id, password, ['^/user/.*$', '^/config/.*$', '^/system/.*$']);
        return e.reply(`已创建账号\n用户名：${e.user_id}\n密码：${password}`) !== undefined;
    }
}, { permission: 'master', priority: -10 });
// 修改面板管理账号密码
export const changePassword = karin.command(/^#(重置|修改)面板(管理)密码/, async (e) => {
    // 判断是否群聊
    if (!e.isPrivate) {
        return e.reply('请私聊发送') !== undefined;
    }
    // 获取消息中的密码
    let password = e.msg.replace(/^#(重置|修改)面板(管理)密码/, '').replace(/\s+/g, '');
    // 检查账号状态
    if (UserManager.checkUser(e.user_id)) {
        if (password) {
            UserManager.changePassword(e.user_id, crypto.createHash('md5').update(password).digest('hex'));
            return e.reply('密码修改成功') !== undefined;
        }
        else {
            return e.reply('命令错误，正确的格式为[#重置面板管理密码 passwoed]') !== undefined;
        }
    }
    else {
        return e.reply('账号不存在，如需创建账号请回复[#添加面板管理账号 密码]') !== undefined;
    }
}, { permission: 'master', priority: -10 });
// 获取面板访问地址
export const panelAddress = karin.command(/^#(访问|登陆)(管理|系统)?(面板|Manage|manage)/, async (e) => {
    // 判断是否群聊
    if (!e.isPrivate) {
        return e.reply('请私聊发送') !== undefined;
    }
    let msg = [];
    msg.push(segment.text('Karin 管理面板\n\n'));
    msg.push(segment.text('你可以登陆官方公共面板 http://karin.alcedo.top/ 输入服务器地址后访问 Karin 管理面板\n\n'));
    if (config.Server.wormhole?.enable || config.Server.wormhole?.server || config.Server.wormhole?.clientId) {
        const wormholeUrl = new URL(config.Server.wormhole?.server);
        if (wormholeUrl) {
            msg.push(segment.text(`代理服务器地址：http://${wormholeUrl.hostname}:${wormholeUrl.port || 80}/web/${config.Server.wormhole?.clientId}/\n`));
        }
    }
    if (config.Config.panelDomain) {
        msg.push(segment.text(`公网服务器地址：http://${config.Config.panelDomain}:${config.Server.port || 80}\n`));
    }
    else {
        const publicIp = await common.getPublicIp();
        msg.push(segment.text(`公网服务器地址：http://${publicIp}:${config.Server.port || 80}\n`));
    }
    return e.reply(msg) !== undefined;
}, { permission: 'master', priority: -10 });
// 重启面板服务
export const restartServer = karin.command(/^#重启面板(服务)?/, async (e) => {
    // 判断是否群聊
    if (!e.isPrivate) {
        return e.reply('请私聊发送') !== undefined;
    }
    return await restart() ? e.reply('面板服务重启成功') !== undefined : e.reply('面板服务重启失败') !== undefined;
}, { permission: 'master', priority: -10 });
