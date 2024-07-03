import { YamlEditor } from 'node-karin';
declare class Permissions {
    tokenTTL: NodeJS.Timeout | undefined;
    token: string | null | undefined;
    secretKey: string;
    OtpTTL: NodeJS.Timeout | null | undefined;
    Otp: string | null | undefined;
    username: string;
    constructor(username: string, secretKey: string);
    tempYaml(): YamlEditor;
    /**
    * 设置otp
    * @param {string} otp 验证码
    */
    setOtp(otp: string): Promise<void>;
    /**
    * 获取otp
    * @returns {boolean} 验证码
    */
    getOtp(): Promise<string | null>;
    /**
    * 删除otp
    */
    delOtp(): Promise<void>;
    /**
    * 设置Token
    * @param {string} token Token
    * @param {boolean} remember 是否记住登陆状态
    */
    setToken(token: string, remember?: boolean): Promise<void>;
    /**
     * 获取Token
     * @returns {string | null} Token
     */
    getToken(): Promise<string | null>;
    /**
     * 删除Token
     */
    delToken(): Promise<void>;
    /**
     * 更新Token过期时间
     */
    expireToken(): Promise<void>;
}
export default Permissions;
