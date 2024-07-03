/**
 * 配置文件
 */
export declare const config: {
    dir: string;
    _path: string;
    _pathDef: string;
    change: Map<string, any>;
    watcher: Map<string, any>;
    review: boolean;
    /** 初始化配置 */
    initCfg(): Promise<void>;
    /**
     * 基本配置
     */
    readonly Config: {
        redis: any;
        append: any;
        logInGroup: any;
        panelDomain: any;
        key: string;
    };
    readonly Server: {
        debug: any;
        terminal: any;
        port: number;
        wormhole: any;
        key: string;
    };
    /**
     * packageon
     * 实时获取packageon文件
     */
    readonly package: any;
    /**
     * 获取配置yaml
     */
    getYaml(type: "defSet" | "config", name: string, isWatch?: boolean): any;
    /**
     * 监听配置文件
     * @param {'defSet'|'config'} type 类型
     * @param {string} name 文件名称 不带后缀
     * @param {string} file 文件路径
     */
    watch(type: "defSet" | "config", name: string, file: string): Promise<true | undefined>;
};
