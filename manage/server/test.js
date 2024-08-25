export default async function (fastify, options) {
  fastify.get('/test', async (request, reply) => {
    
    return `
-
  key: 远程终端
  comment: 开启远程终端后，在面板可以直接访问服务器终端
  path: 'terminal'
  type: 'boolean'
  cols: 3
-
  key: wormhole代理
  comment: 启动wormhole代理
  path: 'wormhole.enable'
  type: 'boolean'
  cols: 3 

`
  })
}
