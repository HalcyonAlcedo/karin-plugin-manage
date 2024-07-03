import { ChildProcess } from 'child_process';
export declare function executeCommand(command: string, args: any, ws: WebSocket, workingDirectory?: string): ChildProcess | null;
