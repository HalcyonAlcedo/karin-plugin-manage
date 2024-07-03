import { Plugin } from 'node-karin';
export declare class Server extends Plugin {
    constructor();
    addAdminUser(): Promise<void>;
    changePassword(): Promise<void>;
    getPanelAddress(): Promise<void>;
    restartServer(): Promise<void>;
}
