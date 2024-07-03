import { YamlEditor } from 'node-karin';
import Permissions from './permissions.js';
interface User {
    username: string;
    password: string;
    routes: Array<string>;
    status: string;
    permissions: Permissions;
}
interface UserLogin {
    token: string;
    tokenExpiry: Date | null;
    routes: Array<string>;
}
declare class UserManager {
    users: User[];
    secretKey: string | undefined;
    constructor();
    init(): Promise<void>;
    tempYaml(): YamlEditor;
    /**
     * 从YAML文件加载用户信息
     * @returns {any} 用户信息
     */
    loadUsersFromYAML(): any;
    /**
     * 获取secretKey
     * @returns {string} secretKey
     */
    getSecretKey(): Promise<string>;
    /**
     * 添加用户
     * @param {string} username 用户名
     * @param {string} password 密码
     * @param {any} routes 权限
     */
    addUser(username: string, password: string, routes: any): void;
    saveUserToYAML(user: User): void;
    saveUserDataToYAML(user: string, key: string, value: string | any): void;
    /**
     * 检查用户是否存在
     * @param {string} username 用户名
     * @returns {boolean} 是否存在
     */
    checkUser(username: string): boolean;
    /**
     * 系统登录接口
     * @param {string} username 用户名
     * @param {string} password 密码
     * @param {boolean} remember 持久登陆
     * @returns {UserLogin|null} 用户信息
     */
    login(username: string, password: string, remember?: boolean): Promise<UserLogin | null>;
    /**
     * 系统快速登录接口
     * @param {string} otp 验证码
     * @param {string} username 用户名
     * @returns {UserLogin|null} 用户信息
     */
    quickLogin(otp: string, username: string): Promise<UserLogin | null>;
    /**
     * 注销接口
     * @param {string} username 用户名
     * @param {string} token Token
     * @returns {booleanl} 是否注销成功
     */
    logout(username: string, token: string): Promise<boolean>;
    /**
     * 验证密码
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {booleanl} 是否通过验证
     */
    validatePassword(username: string, password: string): boolean;
    /**
     * 修改密码
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {booleanl} 是否修改成功
     */
    changePassword(username: string, password: string): boolean;
    /**
     * 更新用户权限
     * @param {string} username 用户名
     * @param {Array<string>} perm 权限
     * @returns {booleanl} 是否修改成功
     */
    changePermissions(username: string, perm: Array<string>): boolean;
    /**
     * 更新token过期时间
     * @param {string} username 用户名
     * @param {string} token Token
     * @returns {booleanl} 是否更新成功
     */
    refreshToken(username: any, token: any): Promise<boolean>;
}
declare const _default: UserManager;
export default _default;
