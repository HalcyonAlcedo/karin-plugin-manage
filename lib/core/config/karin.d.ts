/**
* 获取Karin配置列表
* @returns {array} 验证码
*/
export declare function getKarinConfigList(): string[];
/**
* 获取Karin配置
* @param {string} file 配置文件名
* @returns {object} 配置信息
*/
export declare function getKarinConfig(file: string): {
    config: any;
} | {
    config: any;
    view: any;
    associated: any;
};
/**
* 设置Karin配置
* @param {string} file 配置文件名
* @param {string} key 配置路径
* @param {string | boolean} file 配置值
* @returns {object|undefined} 变动项
*/
export declare function setKarinConfig(file: string, key: string, value: string | boolean): {
    file: string;
    key: string;
    value: any;
    change: string | boolean;
} | undefined;
