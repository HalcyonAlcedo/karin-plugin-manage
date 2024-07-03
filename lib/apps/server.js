import crypto from 'crypto';
import { Plugin, segment } from 'node-karin';
import { common, config } from '../imports/index.js';
import { UserManager } from '../core/user/index.js';
import { start, restart } from '../server/index.js';
// 启动面板api
start();
export class Server extends Plugin {
    constructor() {
        super({
            // 必选 插件名称
            name: 'ManageServer',
            // 插件描述
            dsc: '管理面板服务',
            // 监听消息事件 默认message
            event: 'message',
            // 优先级
            priority: -10,
            // 以下rule、task、button、handler均为可选，如键入，则必须为数组
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#(添加|创建)面板管理账号',
                    /** 执行方法 */
                    fnc: 'addAdminUser',
                    //  是否显示操作日志 true=是 false=否
                    log: true,
                    // 权限 master,owner,admin,all
                    permission: 'master'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#(重置|修改)面板管理密码',
                    /** 执行方法 */
                    fnc: 'changePassword',
                    //  是否显示操作日志 true=是 false=否
                    log: true,
                    // 权限 master,owner,admin,all
                    permission: 'master'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#(访问|登陆)(管理|系统)?(面板|Manage|manage)',
                    /** 执行方法 */
                    fnc: 'getPanelAddress',
                    //  是否显示操作日志 true=是 false=否
                    log: true,
                    // 权限 master,owner,admin,all
                    permission: 'master'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#重启面板(服务)?',
                    /** 执行方法 */
                    fnc: 'restartServer',
                    //  是否显示操作日志 true=是 false=否
                    log: true,
                    // 权限 master,owner,admin,all
                    permission: 'master'
                }
            ]
        });
    }
    async addAdminUser() {
        // 判断是否群聊
        if (!this.e.isPrivate) {
            this.reply('请私聊发送');
            return;
        }
        let msg = this.e.msg;
        let password = msg.replace(/^#(添加|创建)面板管理账号/, '').replace(/[\s\r\n]+/g, '');
        // 检查账号状态
        if (UserManager.checkUser(this.e.user_id)) {
            if (password) {
                UserManager.changePassword(this.e.user_id, crypto.createHash('md5').update(password).digest('hex'));
                this.reply(`检测到账号${this.e.user_id}已存在，密码修改为${password}`);
            }
            else {
                this.reply(`检测到账号${this.e.user_id}已存在，你可以回复[#重置面板管理密码 passwoed]进行密码重置`);
            }
        }
        else {
            if (!password) {
                password = crypto.randomBytes(32).toString().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
            }
            UserManager.addUser(this.e.user_id, password, ['^/user/.*$', '^/config/.*$', '^/system/.*$']);
            this.reply(`已创建账号\n用户名：${this.e.user_id}\n密码：${password}`);
        }
    }
    async changePassword() {
        if (!this.e.isPrivate) {
            this.reply('请私聊发送');
            return;
        }
        let msg = this.e.msg;
        let password = msg.replace(/^#(重置|修改)面板管理密码/, '').replace(/[\s\r\n]+/g, '');
        if (UserManager.checkUser(this.e.user_id)) {
            if (password) {
                await UserManager.changePassword(this.e.user_id, crypto.createHash('md5').update(password).digest('hex'));
                this.reply('密码修改成功');
            }
            else {
                this.reply('命令错误，正确的格式为[#重置面板管理密码 passwoed]');
            }
        }
        else {
            this.reply('账号不存在，如需创建账号请回复[#添加面板管理账号 密码]');
        }
    }
    async getPanelAddress() {
        if (!this.e.isPrivate) {
            this.reply('请私聊发送');
            return;
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
        this.reply(msg);
    }
    async restartServer() {
        if (await restart()) {
            this.reply('面板服务重启成功');
        }
        else {
            this.reply('面板服务重启失败');
        }
    }
}
