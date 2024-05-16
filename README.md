
# Karin Manage 插件
---

## 安装插件

karin根目录执行以下命令安装Karin Manage插件

```bash
git clone https://github.com/HalcyonAlcedo/karin-plugin-manage.git ./plugins/karin-plugin-manage
```

安装依赖

```bash
pnpm install --filter=karin-plugin-manage
```

## 登陆面板
Karin Manage 插件只提供面板访问用的api，需要登陆官方或第三方面板对Karin进行配置

[公共管理面板](http://karin.alcedo.top)

### 连接服务器
#### 直接连接
初次访问管理面板后一般会提示服务器无响应，需要将服务器地址修改为你的Karin Manage 插件服务器地址，你可以通过向机器人发送 #访问面板 获取服务器地址

如果你需要更换其他服务器可以点击登陆页面下方提示内容中的 karin服务器 字样重新输入服务器地址
#### Wormhole代理
如果你的服务器没有公网ip你可能无法使用直接连接访问服务器，此时可以通过配置Wormhole代理连接服务器

在配置文件server.yaml中找到wormhole配置项
 - enable改为true
 - server改为Wormhole的连接地址
 - clientId改为随意的数字+字母组合，此id需要唯一性，建议改为机器人qq号以避免和他人重复

此处提供一个公共Wormhole服务地址，你可以在server处填写 ws://wormhole.alcedo.top:3000/ws/

配置完成后重启karin，向机器人发送#访问面板将获取Wormhole代理的服务器连接

### 快速登陆
在 用户qq 处输入机器人的一个master级别qq号， 机器人qq 处输入一个机器人的qq号，点击快捷登陆后机器人将发送一个验证码给用户qq，将验证码输入在面板中即可登录
### 普通登陆
如果你有管理面板的账号和密码，你可以点击OR后输入用户名和密码登陆面板

## 配置

### config.yaml

- **面板域名** - `panelDomain`
  - 在获取面板访问信息时返回的公共服务器地址将使用此域名

- **获取ip的Api** - `ipApi`
  - 在获取面板访问信息时将使用此api获取服务器公网ip

### server.yaml

- **服务端口** - `port`
  - 面板服务运行的端口

- **调试模式** - `debug`
  - 将显示fastify的日志

- **wormhole代理** - `wormhole`
  - wormhole的配置，详见wormhole代理说明
    - **启动代理** - `enable`
    - **代理服务器** - `server`
    - **客户端id** - `clientId`

- **token的secretKey** - `secretKey`
  - 用于账号验证，如非必要请勿手动修改

### user.yaml

- 用于保存账号数据不要修改


## 机器人命令
### 创建账号
对机器人发送 #创建面板管理账号 或 #创建面板管理账号 password，如果不设置密码将自动生成密码，账号为发送者qq号
### 修改密码
对机器人发送 #修改面板管理密码 password 将重新设置当前账号的密码
### 访问面板
对机器人发送 #访问面板 将发送面板信息

## 相关链接
[Karin](https://github.com/KarinJS/Karin)
[Wormhole](https://github.com/HalcyonAlcedo/wormhole)
