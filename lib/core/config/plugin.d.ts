import { dirName } from 'node-karin';
/**
* 获取插件列表
* @returns {Array} 插件列表
*/
export declare function getPluginsList(): string[];
/**
* 获取单插件列表
* @returns {Array} 单插件列表
*/
export declare function getExamplePluginsList(): string[];
/**
* 获取全部插件配置
* @returns {object} 插件配置信息
*/
export declare function getAllPluginConfig(): any;
/**
* 获取插件配置
* @param {dirName} plugin 插件名
* @returns {object} 配置信息
*/
export declare function getPluginConfig(plugin: dirName): {
    config: any;
    view: any;
    associated: any[] | undefined;
} | {
    config?: undefined;
} | {
    config: any;
};
/**
* 设置插件配置
* @param {dirName} plugin 插件名
* @param {string} file 配置文件名
* @param {string} key 配置路径
* @param {string | boolean} file 配置值
* @returns {object|undefined} 变动项
*/
export declare function setPluginConfig(plugin: dirName, file: string, key: string, value: string | boolean): {
    plugin: string;
    file: string;
    key: string;
    value: any;
    change: string | boolean;
} | undefined;
/**
* 获取全部插件小组件
* @returns {Array} 小组件信息
*/
export declare function GetAllPluginWidgets(): Promise<{
    plugin: string;
    file: string;
    widget: string;
    data: any;
}[]>;
/**
* 获取插件小组件
* @param {dirName} plugin 插件名
* @returns {Array} 小组件信息
*/
export declare function GetPluginWidgets(plugin: dirName): Promise<{
    plugin: string;
    file: string;
    widget: string;
    data: any;
}[]>;
