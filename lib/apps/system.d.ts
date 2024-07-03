import { plugin } from 'node-karin';
export declare class System extends plugin {
    constructor();
    log(): Promise<{
        message_id?: string;
    } | undefined>;
}
