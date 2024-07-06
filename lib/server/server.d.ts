import { FastifyInstance } from 'fastify/types/instance';
interface Options {
    port: number;
    debug: boolean;
    dirname: string;
}
export declare function server(options: Options): Promise<FastifyInstance>;
export declare function startServer(options: Options): Promise<FastifyInstance>;
export declare function restartServer(fastifyInstance: FastifyInstance, options: Options): Promise<FastifyInstance>;
export {};
