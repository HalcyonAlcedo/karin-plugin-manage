import { logger } from 'node-karin';
import { dirPath } from '../imports/dir.js';
import { fs, yaml as Yaml, chokidar } from 'node-karin/modules.js';
/**
 * 配置文件
 */
export const config = new (class Cfg {
    dir;
    _path;
    _pathDef;
    change;
    watcher;
    review;
    constructor() {
        this.dir = dirPath;
        this._path = this.dir + '/config';
        this._pathDef = this.dir + '/config/defSet';
        /** 缓存 */
        this.change = new Map();
        /** 监听文件 */
        this.watcher = new Map();
        /** 拦截器状态 */
        this.review = false;
        this.initCfg();
    }
    /** 初始化配置 */
    async initCfg() {
        if (!fs.existsSync(this._path))
            fs.mkdirSync(this._path);
        this._path = this.dir + '/config/config';
        if (!fs.existsSync(this._path))
            fs.mkdirSync(this._path);
        const files = fs.readdirSync(this._pathDef).filter(file => file.endsWith('.yaml'));
        for (const file of files) {
            const path = `${this._path}/${file}`;
            const pathDef = `${this._pathDef}/${file}`;
            if (!fs.existsSync(path))
                fs.copyFileSync(pathDef, path);
        }
    }
    /**
     * 基本配置
     */
    get Config() {
        const key = 'change.config';
        const res = this.change.get(key);
        /** 取缓存 */
        if (res)
            return res;
        /** 取配置 */
        const config = this.getYaml('config', 'config', true);
        const defSet = this.getYaml('defSet', 'config', false);
        const data = { ...defSet, ...config };
        /** 缓存 */
        this.change.set(key, data);
        return data;
    }
    get Server() {
        const key = 'change.server';
        const res = this.change.get(key);
        /** 取缓存 */
        if (res)
            return res;
        /** 取配置 */
        const config = this.getYaml('config', 'server', true);
        const defSet = this.getYaml('defSet', 'server', false);
        const data = { ...defSet, ...config };
        /** 缓存 */
        this.change.set(key, data);
        return data;
    }
    get Store() {
        const key = 'change.store';
        const res = this.change.get(key);
        /** 取缓存 */
        if (res)
            return res;
        /** 取配置 */
        const config = this.getYaml('config', 'store', true);
        const defSet = this.getYaml('defSet', 'store', false);
        const data = { ...defSet, ...config };
        /** 缓存 */
        this.change.set(key, data);
        return data;
    }
    /**
     * packageon
     * 实时获取packageon文件
     */
    get package() {
        const data = fs.readFileSync('./package.json', 'utf8');
        const pack = JSON.parse(data);
        return pack;
    }
    /**
     * 获取配置yaml
     */
    getYaml(type, name, isWatch = false) {
        /** 文件路径 */
        const file = `${this.dir}/config/${type}/${name}.yaml`;
        /** 读取文件 */
        const data = Yaml.parse(fs.readFileSync(file, 'utf8'));
        /** 监听文件 */
        if (isWatch)
            this.watch(type, name, file);
        return data;
    }
    /**
     * 监听配置文件
     * @param {'defSet'|'config'} type 类型
     * @param {string} name 文件名称 不带后缀
     * @param {string} file 文件路径
     */
    async watch(type, name, file) {
        const key = `change.${name}`;
        /** 已经监听过了 */
        const res = this.change.get(key);
        if (res)
            return true;
        /** 监听文件 */
        const watcher = chokidar.watch(file);
        /** 监听文件变化 */
        watcher.on('change', () => {
            this.change.delete(key);
            logger.mark(`[修改配置文件][${type}][${name}]`);
        });
        /** 缓存 防止重复监听 */
        this.watcher.set(key, watcher);
    }
})();
