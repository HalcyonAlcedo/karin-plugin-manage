import fs from 'fs';
import path from 'path';
import Yaml from 'yaml';
import { YamlEditor, logger, common } from 'node-karin';
import { config } from '../../imports/index.js';
/**
* 获取插件列表
* @returns {Array} 插件列表
*/
export function getPluginsList() {
    const plugins = common.getPlugins();
    return plugins;
}
/**
* 获取单插件列表
* @returns {Array} 单插件列表
*/
export function getExamplePluginsList() {
    const exampleDir = './plugins/karin-plugin-example';
    return fs.existsSync(exampleDir)
        ? fs.readdirSync(exampleDir).filter(fileName => fileName.endsWith('.js'))
        : [];
}
function deconstruct(pair, yamlPath = '') {
    if (pair.constructor.name != 'Pair') {
        return [pair.value || pair];
    }
    yamlPath = pair.key ? `${yamlPath}${yamlPath ? '.' : ''}${pair.key.value}` : '';
    let configData = [];
    let configValue;
    if (!pair.value) {
        if (pair.items) {
            let arrayConfigData = [];
            for (let i in pair.items) {
                arrayConfigData = [...arrayConfigData, ...deconstruct(pair.items[i], `${yamlPath}[${i}]`)];
            }
            configData.push({
                key: pair.key?.value || 'NULL',
                value: arrayConfigData,
                comment: pair.key?.commentBefore || '',
                path: yamlPath
            });
            return configData;
        }
        return configData;
    }
    if (pair.value.items) {
        configValue = [];
        for (let pairData of pair.value.items) {
            configValue = [...configValue, ...deconstruct(pairData, yamlPath)];
        }
    }
    else if (pair.value.value != undefined) {
        configValue = pair.value.value;
    }
    if (configValue === undefined || configValue === null) {
        configValue = 'NULL';
    }
    configData.push({
        key: pair.key?.value || 'NULL',
        value: configValue,
        comment: pair.key?.commentBefore || pair.value.comment || '',
        path: yamlPath
    });
    return configData;
}
/**
* 获取全部插件配置
* @returns {object} 插件配置信息
*/
export function getAllPluginConfig() {
    const plugins = getPluginsList();
    let configs = {};
    for (const plugin of plugins) {
        let config_plugin = {};
        const configPath = `plugins/${plugin}/config/config/`;
        if (fs.existsSync(configPath)) {
            const yamlFiles = fs.readdirSync(configPath).filter(file => file.endsWith('.yaml'));
            for (const cfg of yamlFiles) {
                const yamlContent = fs.readFileSync(path.join(configPath, cfg), { encoding: 'utf-8' });
                config_plugin[path.parse(cfg).name] = Yaml.parse(yamlContent);
            }
        }
        configs[plugin] = config_plugin;
    }
    return configs;
}
function getPluginAssociated(view, plugin, file) {
    let associated = [];
    for (const config of view) {
        if (config.type === 'group' && config.part) {
            associated = [...associated, ...getPluginAssociated(config.part, plugin, file)];
        }
        else if (config.associated && Array.isArray(config.associated)) {
            for (const item of config.associated) {
                const associatedFile = item.file || file;
                const karinConfig = new YamlEditor(`plugins/${plugin}/config/config/${associatedFile}`);
                associated.push({
                    config: config.path,
                    target: {
                        file: associatedFile,
                        path: item.path,
                        value: karinConfig.get(item.path),
                        expected: item.requirement
                    }
                });
            }
        }
    }
    return associated;
}
function deconstructView(view, yaml) {
    let viewData = [];
    for (let config of view) {
        let value;
        if (config.default === undefined || config.default === null) {
            switch (config.type) {
                case 'text':
                    config.default = '';
                    break;
                case 'url':
                    config.default = '';
                    break;
                case 'boolean':
                    config.default = false;
                    break;
                default:
                    config.default = '';
                    break;
            }
        }
        if (config.type === 'group' && config.part) {
            value = deconstructView(config.part, yaml);
        }
        else {
            value = yaml.has(config.path) ? yaml.get(config.path) : config.default;
        }
        viewData.push({
            key: config.key,
            comment: config.comment,
            path: config.path,
            type: config.type || 'text',
            item: config.item,
            multiple: config.multiple,
            value: value
        });
    }
    return viewData;
}
function getPluginView(plugin) {
    const configFile = `plugins/${plugin}/config/PluginConfigView.yaml`;
    let pluginConfigData = {};
    let view;
    let associated;
    if (fs.existsSync(configFile)) {
        const yamlEditor = new YamlEditor(configFile);
        const yamlData = yamlEditor.get('');
        view = yamlData;
        for (const config of yamlData) {
            const pluginFileNamePath = path.parse(config.file);
            const fileYaml = new YamlEditor(`plugins/${plugin}/config/config/${config.file}`);
            let viewData = deconstructView(config.view, fileYaml);
            associated = getPluginAssociated(config.view, plugin, config.file);
            pluginConfigData[pluginFileNamePath.name] = viewData;
        }
    }
    return { config: pluginConfigData, view, associated };
}
/**
* 获取插件配置
* @param {dirName} plugin 插件名
* @returns {object} 配置信息
*/
export function getPluginConfig(plugin) {
    const plugins = getPluginsList();
    if (!plugins.includes(plugin)) {
        return {};
    }
    let configs = {};
    const configPath = `plugins/${plugin}/config/config/`;
    if (fs.existsSync(configPath)) {
        // 如果有视图配置文件，直接返回视图规定的配置信息
        if (fs.existsSync(`plugins/${plugin}/config/PluginConfigView.yaml`)) {
            return getPluginView(plugin);
        }
        const yamlFiles = fs.readdirSync(configPath).filter(file => file.endsWith('.yaml'));
        for (const cfg of yamlFiles) {
            const yamlContent = new YamlEditor(path.join(configPath, cfg));
            let current = yamlContent.document.contents;
            let pluginCfg = [];
            for (let pair of current.items) {
                pluginCfg = [...pluginCfg, ...deconstruct(pair)];
            }
            configs[path.parse(cfg).name] = pluginCfg;
        }
    }
    return { config: configs };
}
/**
* 设置插件配置
* @param {dirName} plugin 插件名
* @param {string} file 配置文件名
* @param {string} key 配置路径
* @param {string | boolean} file 配置值
* @returns {object|undefined} 变动项
*/
export function setPluginConfig(plugin, file, key, value) {
    const plugins = getPluginsList();
    if (!plugins.includes(plugin)) {
        return;
    }
    const configPath = `plugins/${plugin}/config/config/`;
    if (fs.existsSync(configPath)) {
        const yamlFile = path.join(configPath, file + '.yaml');
        try {
            const yamlEditor = new YamlEditor(yamlFile);
            logger.info(`设置：${yamlFile}`);
            if (yamlEditor.has(key)) {
                const oleValue = yamlEditor.get(key);
                yamlEditor.set(key, value);
                yamlEditor.save();
                return {
                    plugin, file, key,
                    value: oleValue, change: value
                };
            }
            else if (config.Config.append) {
                yamlEditor.set(key, value);
                yamlEditor.save();
                return {
                    plugin, file, key,
                    value: null, change: value
                };
            }
            else {
                return;
            }
        }
        catch (error) {
            logger.error(`设置${yamlFile}失败`, error);
            return;
        }
    }
}
/**
* 获取全部插件小组件
* @returns {Array} 小组件信息
*/
export async function GetAllPluginWidgets() {
    const plugins = getPluginsList();
    let widgets = [];
    for (const plugin of plugins) {
        const widgetPath = `plugins/${plugin}/manage/widgets/`;
        if (fs.existsSync(widgetPath)) {
            const widgetFiles = fs.readdirSync(widgetPath).filter(file => file.endsWith('.vue'));
            // 获取静态组件
            for (const widget of widgetFiles) {
                let data;
                try {
                    data = await (await import(`../../../../plugins/${plugin}/manage/widgets/${path.parse(widget).name}.js`)).default();
                }
                catch (err) {
                    data = undefined;
                }
                widgets.push({
                    plugin: plugin,
                    file: widget,
                    widget: fs.readFileSync(path.join(widgetPath, widget), { encoding: 'utf-8' }),
                    data: data
                });
            }
        }
    }
    return widgets;
}
/**
* 获取插件小组件
* @param {dirName} plugin 插件名
* @returns {Array} 小组件信息
*/
export async function GetPluginWidgets(plugin) {
    const plugins = getPluginsList();
    if (!plugins.includes(plugin)) {
        return [];
    }
    let widgets = [];
    const widgetPath = `plugins/${plugin}/manage/widgets/`;
    if (fs.existsSync(widgetPath)) {
        const widgetFiles = fs.readdirSync(widgetPath).filter(file => file.endsWith('.vue'));
        // 获取静态组件
        for (const widget of widgetFiles) {
            let data;
            try {
                data = await (await import(`../../../../plugins/${plugin}/manage/widgets/${path.parse(widget).name}.js`)).default();
            }
            catch (err) {
                data = undefined;
            }
            widgets.push({
                plugin: plugin,
                file: widget,
                widget: fs.readFileSync(path.join(widgetPath, widget), { encoding: 'utf-8' }),
                data: data
            });
        }
    }
    return widgets;
}
