import { KarinAdapter } from 'node-karin';
interface DynamicObject {
    [key: string]: KarinAdapter;
}
export declare function getBots(): DynamicObject;
export {};
