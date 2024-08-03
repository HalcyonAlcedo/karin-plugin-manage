
# Karin Manage 插件
---

## 安装插件

karin根目录执行以下命令安装Karin Manage插件

### 国外推荐(GitHub)
```bash
git clone --depth=1 https://github.com/HalcyonAlcedo/karin-plugin-manage.git ./plugins/karin-plugin-manage
```

### 国内推荐(ghproxy)
```bash
git clone --depth=1 https://mirror.ghproxy.com/https://github.com/HalcyonAlcedo/karin-plugin-manage.git ./plugins/karin-plugin-manage
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
建议在配置好服务后直接登陆面板对插件进行配置

### server.yaml

- **服务端口** - `port`
  - 面板服务运行的端口

- **wormhole代理** - `wormhole`
  - wormhole的配置，详见wormhole代理说明
    - **启动代理** - `enable`
    - **代理服务器** - `server`
    - **客户端id** - `clientId`


## 机器人命令
### 创建账号
对机器人发送 #创建面板管理账号 或 #创建面板管理账号 password，如果不设置密码将自动生成密码，账号为发送者qq号
### 修改密码
对机器人发送 #修改面板管理密码 password 将重新设置当前账号的密码
### 访问面板
对机器人发送 #访问面板 将发送面板信息

## 插件开发
Manage支持插件编写自定义的配置项视图、主页小组件、自定义api接口，根据下方文档在你的插件中加入对应文件即可自动载入这些配置。

### 配置项视图
面板默认情况下会读取config文件夹中的配置文件结构生成简易视图，如果需要自定义视图行为，可以编写配置项视图文件。
#### 创建配置视图文件

要创建一个新的配置视图，您需要在`config`文件夹下新建一个名为`PluginConfigView.yaml`的文件。这个文件将定义您的插件配置界面的布局和行为。

#### 配置视图文件结构

配置视图文件是一个YAML文件，它包含以下几个部分：

- `name`: 视图的名称。
- `file`: 关联的配置文件名。
- `view`: 视图的详细配置项列表。

每个配置项包括：

- `key`: 配置项的键名。
- `comment`: 配置项的描述。
- `path`: 在配置文件中的路径。
- `type`: 配置项的类型（例如：text, url, boolean, select, number, group）。

对于`select`和`group`类型的配置项，还需要提供额外的信息：

- 对于`select`类型，需要提供一个`item`列表，每个`item`包含`name`和`value`。
- 对于`group`类型，需要提供一个`part`列表，每个`part`包括子项的数据。
#### 示例：通用配置视图
```yaml
-
  # 配置文件描述
  name: 通用配置
  # 配置文件名
  file: config.yaml
  # 视图信息
  view:
    -
      # 配置项
      key: 测试配置
      # 配置描述
      comment: 描述
      # 配置路径
      path: 'test'
      # 配置类型
      type: 'text'
    -
      key: 选项
      comment: 视图中显示为name，返回配置结果为value
      path: 'testSelect'
      type: 'select'
      # 是否可以多选
      multiple: false
      # 选项
      item:
        -
          name: 选项1
          value: 1
        -
          name: 选项2
          value: 2
    -
      key: 群组
      comment: 可以在同一个配置文件中对多个配置进行分组管理
      path: 'testGroup'
      type: 'group'
      # 子项
      part:
        -
          key: 群组中的子配置
          comment: 代理服务器链接地址，例：ws://localhost:3000/ws/
          # 路径需要包含群组路径，用.连接
          path: 'testGroup.test'
          type: 'url'
```

### 面板主页小组件
面板主页可加载插件的小组件，用于自定义显示信息，配合自定义api还可实现面板触发插件操作。

#### 文件命名和存放
- Vue组件文件应该是.vue扩展名的文件。
- 配置数据文件应该是.js扩展名的文件。
- 两个文件的文件名需要保持一致。
- 文件应该存放在manage/widgets文件夹中。
不同的文件名将生成多个不同的组件。

#### 开发流程
1. 在manage/widgets文件夹中创建一个新的.vue文件和一个同名的.js文件。
2. 在.vue文件中编写Vue组件代码。
3. 在.js文件中编写配置数据代码。
4. 确保两个文件的文件名一致。
5. 测试组件以确保其按预期工作。

#### 编写面板小组件
##### 组件结构

Vue组件使用Vue 3的Composition API来定义。组件接收三个props：

- `request`: 封装了axios的函数，支持get和post操作。
- `apiUrl`: 当前系统的API地址，用于调用系统API。
- `data`: 组件的自定义导入数据。

##### 示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps({
  request: Function,
  apiUrl: String,
  data: Object
});

const request = props.request;
const apiData = ref('');

request.post(`${props.apiUrl}/system/plugins/插件名/接口名`)
  .then((response) => {
    if (response.data.status === 'success') {
      apiData.value = response.data.data;
    } else {
      apiData.value = '';
    }
  })
  .catch((error) => {
      apiData.value = '';
  });
</script>

<template>
  <v-card elevation="0" class="bg-secondary overflow-hidden bubble-shape bubble-secondary-shape">
    <v-card-text>
      <h2 class="text-h1 font-weight-medium">
        api数据 {{ apiData }} 导入数据 {{ props.data.msg }}
      </h2>
      <span class="text-subtitle-1 text-medium-emphasis text-white">插件数量</span>
    </v-card-text>
  </v-card>
</template>
```
#### 编写小组件数据
小组件支持自定义加载数据，这是可选的，要保证和小组件的文件名一致。
##### 数据结构
配置数据是一个JavaScript文件，默认导出一个异步函数，该函数返回一个对象。对象中包含col属性，用于设置Vue组件的列宽。

##### 示例代码
```javascript
export default async () => {
  return { col: 4, msg: '导出数据' };
};
```

### 自定义API接口
自定义API接口允许您扩展面板的功能，通过Fastify路由处理不同的请求。
#### 创建自定义API接口文件

自定义API接口文件应该保存在`manage/server`文件夹中。每个接口文件都是一个`.js`文件，文件中默认导出一个函数。这个函数包含Fastify路由定义。

#### API接口文件结构

API接口文件包含以下几个部分：

- 默认导出的函数：这个函数接收两个参数，`fastify`和`options`。
- 路由定义：使用`fastify`对象定义路由，可以是`get`, `post`, `put`, `delete`等HTTP方法。

#### 示例代码

```javascript
export default async function (fastify, options) {
  fastify.get('/test', async (request, reply) => {
    // 处理GET请求
    return reply.send({
      status: 'success',
      data: 'test'
    });
  });

  // 可以添加更多路由...
}
```
#### 访问接口
生成的接口将在面板的/system/plugins/路径下，比如插件为test，创建的接口为get，请求路径为http://localhost:5333/system/plugins/test/get
#### 开发流程
1. 在manage/server文件夹中创建一个新的.js文件。
2. 编写默认导出的函数，定义所需的Fastify路由。
3. 测试API接口以确保其按预期工作。
#### 注意事项
- 确保您的API接口逻辑正确，能够处理各种可能的请求和错误情况。
- 使用合适的HTTP状态码和消息来响应请求。
- 保持代码的清晰和模块化，以便于维护和扩展。
- 以上就是自定义API接口开发的基本流程和指南。如果您有任何疑问或需要进一步的帮助，请随时联系我！

## 相关链接
[Karin](https://github.com/KarinJS/Karin)
[Wormhole](https://github.com/HalcyonAlcedo/wormhole)
