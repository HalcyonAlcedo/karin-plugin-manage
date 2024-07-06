import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Yaml from 'yaml';
import fs from 'fs';
import { YamlEditor, redis as db } from 'node-karin';
import { common } from '../../imports/index.js';
import Permissions from './permissions.js';
class UserManager {
    users;
    secretKey;
    constructor() {
        this.users = [];
        this.init();
    }
    async init() {
        this.secretKey = await this.getSecretKey();
        this.users = this.loadUsersFromYAML();
    }
    tempYaml() {
        if (!fs.existsSync('data/karin-plugin-manage/temp.yaml')) {
            fs.writeFileSync('data/karin-plugin-manage/temp.yaml', '', 'utf8');
        }
        return new YamlEditor('data/karin-plugin-manage/temp.yaml');
    }
    /**
     * 从YAML文件加载用户信息
     * @returns {any} 用户信息
     */
    loadUsersFromYAML() {
        // 初始化用户配置
        if (!fs.existsSync('data/karin-plugin-manage/user.yaml')) {
            fs.writeFileSync('data/karin-plugin-manage/user.yaml', '', 'utf8');
        }
        const yamlEditor = new YamlEditor('data/karin-plugin-manage/user.yaml');
        let userData = yamlEditor.get('') || [];
        if (this.secretKey) {
            for (const i in userData) {
                userData[i].permissions = new Permissions(userData[i].username, this.secretKey);
            }
        }
        return userData;
    }
    /**
     * 获取secretKey
     * @returns {string} secretKey
     */
    async getSecretKey() {
        const tempData = this.tempYaml();
        let secretKey;
        try {
            secretKey = await db.get(`karin-plugin-manage:secretKey`) ?? '';
        }
        catch (error) {
            secretKey = tempData.get('secretKey');
        }
        if (!secretKey) {
            secretKey = crypto.randomBytes(64).toString('hex');
            try {
                await db.set('karin-plugin-manage:secretKey', secretKey);
            }
            catch (error) {
                tempData.set('secretKey', secretKey);
                tempData.save();
            }
        }
        return secretKey;
    }
    /**
     * 添加用户
     * @param {string} username 用户名
     * @param {string} password 密码
     * @param {any} routes 权限
     */
    addUser(username, password, routes) {
        if (this.checkUser(username) || !this.secretKey)
            return;
        const hashedPassword = bcrypt.hashSync(common.md5(password), 10);
        const newUser = {
            username,
            password: hashedPassword,
            routes,
            status: 'enabled', // 默认启用账号
            permissions: new Permissions(username, this.secretKey)
        };
        this.users.push(newUser);
        this.saveUserToYAML(newUser);
    }
    saveUserToYAML(user) {
        const yamlEditor = new YamlEditor('data/karin-plugin-manage/user.yaml');
        yamlEditor.pusharr(user);
        yamlEditor.save();
    }
    // 修改用户信息到YAML文件
    saveUserDataToYAML(user, key, value) {
        if (!this.checkUser(user))
            return;
        const yamlEditor = new YamlEditor('data/karin-plugin-manage/user.yaml');
        const document = yamlEditor.document;
        if (document) {
            const current = document.contents;
            if (current) {
                if (current instanceof Yaml.YAMLSeq) {
                    for (let i in current.items) {
                        let target = false;
                        let ySeq = current.items[i];
                        if (ySeq instanceof Yaml.YAMLMap) {
                            for (let l in ySeq.items) {
                                let yMap = ySeq.items[l];
                                if (yMap instanceof Yaml.Pair) {
                                    if (yMap.key.value === 'username' && yMap.value.value === user) {
                                        target = true;
                                    }
                                    if (yMap.key.value === key && target) {
                                        if (typeof value === "string") {
                                            yMap.value.value = value;
                                        }
                                        else {
                                            const yamlSeq = new Yaml.YAMLSeq();
                                            value.forEach((element) => {
                                                yamlSeq.add(element);
                                            });
                                            yMap.value = yamlSeq;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                yamlEditor.save();
            }
        }
    }
    /**
     * 检查用户是否存在
     * @param {string} username 用户名
     * @returns {boolean} 是否存在
     */
    checkUser(username) {
        const user = this.users.find(u => u.username === username);
        return !!user;
    }
    /**
     * 系统登录接口
     * @param {string} username 用户名
     * @param {string} password 密码
     * @param {boolean} remember 持久登陆
     * @returns {UserLogin|null} 用户信息
     */
    // 系统登录接口
    async login(username, password, remember) {
        const user = this.users.find(u => u.username === username);
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return null;
        }
        const token = jwt.sign({ username, routes: user.routes }, user.permissions?.secretKey ?? '', remember ? undefined : { expiresIn: '1h' });
        if (token) {
            await user.permissions.setToken(token, remember);
            const tokenExpiry = remember ? null : new Date(new Date().getTime() + 60 * 60 * 1000);
            return { token, tokenExpiry, routes: user.routes };
        }
        return null;
    }
    /**
     * 系统快速登录接口
     * @param {string} otp 验证码
     * @param {string} username 用户名
     * @returns {UserLogin|null} 用户信息
     */
    async quickLogin(otp, username) {
        let user = this.users.find(u => u.username === username);
        if (!user) {
            user = this.users.find(u => bcrypt.compareSync(u.username.toString(), username.toString()));
        }
        if (user) {
            const auth = await user.permissions.getOtp();
            if (otp != auth) {
                return null;
            }
            const token = jwt.sign({ username: user.username, routes: user.routes }, user.permissions?.secretKey ?? '', { expiresIn: '1h' });
            if (token) {
                await user.permissions.setToken(token, false);
                await user.permissions.delOtp();
                const tokenExpiry = new Date(new Date().getTime() + 60 * 60 * 1000);
                return { user: user.username, token, tokenExpiry, routes: user.routes };
            }
        }
        return null;
    }
    /**
     * 注销接口
     * @param {string} username 用户名
     * @param {string} token Token
     * @returns {booleanl} 是否注销成功
     */
    async logout(username, token) {
        let user = this.users.find(u => u.username === username);
        if (user) {
            const currentToken = await user.permissions.getToken();
            if (token === currentToken) {
                await user.permissions.delToken();
                return true;
            }
        }
        return false;
    }
    /**
     * 验证密码
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {booleanl} 是否通过验证
     */
    validatePassword(username, password) {
        const user = this.users.find(u => u.username === username);
        if (user) {
            return bcrypt.compareSync(password, user.password);
        }
        return false;
    }
    /**
     * 修改密码
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {booleanl} 是否修改成功
     */
    changePassword(username, password) {
        const user = this.users.find(u => u.username === username);
        if (user) {
            const hashedNewPassword = bcrypt.hashSync(password, 10);
            user.password = hashedNewPassword;
            // 修改配置文件
            this.saveUserDataToYAML(username, 'password', hashedNewPassword);
            return true;
        }
        return false;
    }
    /**
     * 更新用户权限
     * @param {string} username 用户名
     * @param {Array<string>} perm 权限
     * @returns {booleanl} 是否修改成功
     */
    changePermissions(username, perm) {
        // 查找用户并更新权限
        const user = this.users.find(u => u.username === username);
        if (!user) {
            throw new Error('User not found');
        }
        // 更新用户权限
        user.routes = perm;
        // 修改配置文件
        this.saveUserDataToYAML(username, 'routes', perm);
        return true;
    }
    /**
     * 更新token过期时间
     * @param {string} username 用户名
     * @param {string} token Token
     * @returns {booleanl} 是否更新成功
     */
    async refreshToken(username, token) {
        const user = this.users.find(u => u.username === username);
        if (user) {
            const currentToken = await user.permissions.getToken();
            if (token === currentToken) {
                await user.permissions.expireToken(); // 更新token的过期时间
            }
        }
        return false;
    }
}
export default new UserManager();
