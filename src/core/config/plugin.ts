import fs from 'fs'
import path from 'path'
import Yaml from 'yaml'
import { YamlEditor, logger, common, dirName } from 'node-karin'
import { config } from '@plugin/imports'

/**
* 获取插件列表
* @returns {Array} 插件列表
*/
export function getPluginsList() {
  const plugins = common.getPlugins()
  return plugins
}

/**
* 获取npm插件列表
* @returns {Array} 插件列表
*/
export function getNpmPluginsList() {
  const plugins = common.getNpmPlugins(false)
  return plugins
}

/**
* 获取插件信息
* @returns {Array} 插件列表
*/
export function getPluginsInfo(plugin: string) {
  const pluginPkg = common.pkgJson(plugin)
  return {
    name: pluginPkg?.name,
    version: pluginPkg?.version,
    author: pluginPkg?.author
  }
}

/**
* 获取单插件列表
* @returns {Array} 单插件列表
*/
export function getExamplePluginsList() {
  const exampleDir = './plugins/karin-plugin-example'
  return fs.existsSync(exampleDir)
    ? fs.readdirSync(exampleDir).filter(fileName => fileName.endsWith('.js'))
    : []
}

function deconstruct(pair: any, yamlPath: string = ''): any[] {
  if (pair.constructor.name != 'Pair') {
    return [pair.value || pair]
  }
  let newPath = '';
  if (pair.key) {
    newPath = yamlPath ? `${yamlPath}.${pair.key.value}` : pair.key.value;
  }
  yamlPath = newPath;
  let configData: any[] = []
  let configValue: any[] | string | null | undefined
  if (!pair.value) {
    if (pair.items) {
      let arrayConfigData: any[] = []
      for (let i in pair.items) {
        arrayConfigData = [...arrayConfigData, ...deconstruct(pair.items[i], `${yamlPath}[${i}]`)]
      }
      configData.push({
        key: pair.key?.value || 'NULL',
        value: arrayConfigData,
        comment: pair.key?.commentBefore || '',
        path: yamlPath
      })
      return configData
    }
    return configData
  }
  if (pair.value.items) {
    configValue = []
    for (let pairData of pair.value.items) {
      configValue = [...configValue, ...deconstruct(pairData, yamlPath)]
    }
  } else if (pair.value.value != undefined) {
    configValue = pair.value.value
  }
  if (configValue === undefined || configValue === null) {
    configValue = 'NULL'
  }
  configData.push(
    {
      key: pair.key?.value || 'NULL',
      value: configValue,
      comment: pair.key?.commentBefore || pair.value.comment || '',
      path: yamlPath
    }
  )
  return configData
}

/**
* 获取全部插件配置
* @returns {object} 插件配置信息
*/
export function getAllPluginConfig(): any {
  const plugins = getPluginsList()
  let configs: any = {}
  for (const plugin of plugins) {
    let config_plugin: any = {}

    const configPathCustom = `config/plugin/${plugin}/`
    const configPathDefault = `plugins/${plugin}/config/config/`

    const customFiles = fs.existsSync(configPathCustom)
      ? fs.readdirSync(configPathCustom).filter(file => file.endsWith('.yaml'))
      : []

    const defaultFiles = fs.existsSync(configPathDefault)
      ? fs.readdirSync(configPathDefault).filter(file => file.endsWith('.yaml'))
      : []

    // 优先使用config/plugin/${plugin}/目录下的文件
    const allFiles = new Set([...defaultFiles, ...customFiles])

    for (const file of allFiles) {
      const filePath = customFiles.includes(file)
        ? path.join(configPathCustom, file)
        : path.join(configPathDefault, file)

      const yamlContent = fs.readFileSync(filePath, { encoding: 'utf-8' })
      config_plugin[path.parse(file).name] = Yaml.parse(yamlContent)
    }

    configs[plugin] = config_plugin
  }
  return configs
}

function getPluginAssociated(view: any[], plugin: string, file: string) {
  let associated: any[] = []
  for (const config of view) {
    if (config.type === 'group' && config.part) {
      associated = [...associated, ...getPluginAssociated(config.part, plugin, file)]
    } else if (config.associated && Array.isArray(config.associated)) {
      for (const item of config.associated) {
        const associatedFile = item.file || file
        const karinConfig = new YamlEditor(`plugins/${plugin}/config/config/${associatedFile}`)
        associated.push({
          config: config.path,
          target: {
            file: associatedFile,
            path: item.path,
            value: karinConfig.get(item.path),
            expected: item.requirement
          }
        })
      }
    }
  }
  return associated
}

function deconstructView(view: any[], yaml: YamlEditor): any[] {
  let viewData = []
  for (let config of view) {
    let value

    if (config.default === undefined || config.default === null) {
      switch (config.type) {
        case 'text':
          config.default = ''
          break;
        case 'url':
          config.default = ''
          break;
        case 'boolean':
          config.default = false
          break;
        default:
          config.default = ''
          break;
      }
    }

    if (config.type === 'group' && config.part) {
      value = deconstructView(config.part, yaml)
    } else {
      value = yaml.has(config.path) ? yaml.get(config.path) : config.default
    }

    viewData.push({
      key: config.key,
      comment: config.comment,
      path: config.path,
      type: config.type || 'text',
      item: config.item,
      multiple: config.multiple,
      cols: config.cols,
      value: value
    })

  }
  return viewData
}

function getPluginView(plugin: string) {
  const configFile = `plugins/${plugin}/config/PluginConfigView.yaml`
  let pluginConfigData: any = {}
  let view
  let associated
  if (fs.existsSync(configFile)) {
    const yamlEditor = new YamlEditor(configFile)
    const yamlData = yamlEditor.get('')
    view = yamlData
    for (const config of yamlData) {
      const pluginFileNamePath = path.parse(config.file)
      const fileYaml = new YamlEditor(`plugins/${plugin}/config/config/${config.file}`)
      let viewData = deconstructView(config.view, fileYaml)
      associated = getPluginAssociated(config.view, plugin, config.file)
      pluginConfigData[pluginFileNamePath.name] = viewData
    }
  }
  return { config: pluginConfigData, view, associated }
}

/**
* 获取插件配置
* @param {dirName} plugin 插件名
* @returns {object} 配置信息
*/
export function getPluginConfig(plugin: dirName) {
  const plugins = getPluginsList()
  if (!plugins.includes(plugin)) {
    return {}
  }
  let configs: any = {}

  const configPathCustom = `config/plugin/${plugin}/`
  const configPathDefault = `plugins/${plugin}/config/config/`

  const customFiles = fs.existsSync(configPathCustom)
    ? fs.readdirSync(configPathCustom).filter(file => file.endsWith('.yaml'))
    : []

  const defaultFiles = fs.existsSync(configPathDefault)
    ? fs.readdirSync(configPathDefault).filter(file => file.endsWith('.yaml'))
    : []

  // 如果有视图配置文件，直接返回视图规定的配置信息
  const configViewPath = `plugins/${plugin}/config/PluginConfigView.yaml`
  if (fs.existsSync(configViewPath)) {
    return getPluginView(plugin)
  }

  // 优先使用config/plugin/${plugin}/目录下的文件
  const allFiles = new Set([...defaultFiles, ...customFiles])

  for (const file of allFiles) {
    const filePath = customFiles.includes(file)
      ? path.join(configPathCustom, file)
      : path.join(configPathDefault, file)

    const yamlContent = new YamlEditor(filePath)
    let current: any = yamlContent.document.contents
    let pluginCfg: any[] = []
    for (let pair of current.items) {
      pluginCfg = [...pluginCfg, ...deconstruct(pair)]
    }
    configs[path.parse(file).name] = pluginCfg
  }

  return { config: configs }
}

/**
* 设置插件配置
* @param {dirName} plugin 插件名
* @param {string} file 配置文件名
* @param {string} key 配置路径
* @param {string | boolean} file 配置值
* @returns {object|undefined} 变动项
*/
export function setPluginConfig(plugin: dirName, file: string, key: string, value: string | boolean) {
  const plugins = getPluginsList()
  if (!plugins.includes(plugin)) {
    return
  }

  const configPathCustom = `config/plugin/${plugin}/`
  const configPathDefault = `plugins/${plugin}/config/config/`

  // 优先使用config/plugin/${plugin}/目录下的文件
  const yamlFile = fs.existsSync(path.join(configPathCustom, file + '.yaml'))
    ? path.join(configPathCustom, file + '.yaml')
    : path.join(configPathDefault, file + '.yaml')

  try {
    const yamlEditor = new YamlEditor(yamlFile)
    logger.info(`设置：${yamlFile}`)
    if (yamlEditor.has(key)) {
      const oleValue = yamlEditor.get(key)
      yamlEditor.set(key, value)
      yamlEditor.save()
      return {
        plugin, file, key,
        value: oleValue, change: value
      }
    } else if (config.Config.append) {
      yamlEditor.set(key, value)
      yamlEditor.save()
      return {
        plugin, file, key,
        value: null, change: value
      }
    } else {
      return
    }
  } catch (error) {
    logger.error(`设置${yamlFile}失败`, error)
    return
  }
}

/**
* 获取全部插件小组件
* @returns {Array} 小组件信息
*/
export async function GetAllPluginWidgets() {
  const plugins = getPluginsList()
  let widgets = []
  for (const plugin of plugins) {
    const widgetPath = `plugins/${plugin}/manage/widgets/`
    if (fs.existsSync(widgetPath)) {
      const widgetFiles = fs.readdirSync(widgetPath).filter(file => file.endsWith('.vue'))
      // 获取静态组件
      for (const widget of widgetFiles) {
        let data
        try {
          data = await (await import(`../../../../plugins/${plugin}/manage/widgets/${path.parse(widget).name}.js`)).default()
        } catch (err) {
          data = undefined
        }
        widgets.push({
          plugin: plugin,
          file: widget,
          widget: fs.readFileSync(path.join(widgetPath, widget), { encoding: 'utf-8' }),
          data: data
        })
      }
    }
  }
  return widgets
}

/**
* 获取插件小组件
* @param {dirName} plugin 插件名
* @returns {Array} 小组件信息
*/
export async function GetPluginWidgets(plugin: dirName) {
  const plugins = getPluginsList()
  if (!plugins.includes(plugin)) {
    return []
  }
  let widgets = []
  const widgetPath = `plugins/${plugin}/manage/widgets/`
  if (fs.existsSync(widgetPath)) {
    const widgetFiles = fs.readdirSync(widgetPath).filter(file => file.endsWith('.vue'))
    // 获取静态组件
    for (const widget of widgetFiles) {
      let data
      try {
        data = await (await import(`../../../../plugins/${plugin}/manage/widgets/${path.parse(widget).name}.js`)).default()
      } catch (err) {
        data = undefined
      }
      widgets.push({
        plugin: plugin,
        file: widget,
        widget: fs.readFileSync(path.join(widgetPath, widget), { encoding: 'utf-8' }),
        data: data
      })
    }
  }
  return widgets
}
