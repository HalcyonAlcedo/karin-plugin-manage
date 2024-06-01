import { YamlEditor, logger } from '#Karin'
import loader from '../../../../lib/plugins/loader.js'
import fs from 'fs'
import path from 'path'
import Yaml from 'yaml'
import { Config } from '#Plugin'

const getPluginsList = () => {
  const plugins = loader.getPlugins()
  return [...new Set(plugins.map(plugin => plugin.dir.split('/')[0]))]
}

const deconstruct = (pair, yamlPath = '') => {
  if (pair.constructor.name != 'Pair') {
    return [pair.value || pair]
  }
  yamlPath = pair.key ? `${yamlPath}${yamlPath ? '.' : ''}${pair.key.value}` : ''
  let configData = []
  let configValue
  if (!pair.value) {
    if (pair.items) {
      let arrayConfigData = []
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
    /*
    // 异常的pair结构
    else {
      console.log(pair)
    }
    */
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
const getAllPluginConfig = () => {
  const plugins = getPluginsList()
  let configs = {}
  for (const plugin of plugins) {
    let config_plugin = {}
    const configPath = `plugins/${plugin}/config/config/`
    if (fs.existsSync(configPath)) {
      const yamlFiles = fs.readdirSync(configPath).filter(file => file.endsWith('.yaml'))
      for (const cfg of yamlFiles) {
        const yamlContent = fs.readFileSync(path.join(configPath, cfg), { encoding: 'utf-8' });
        config_plugin[path.parse(cfg).name] = Yaml.parse(yamlContent)
      }
    }
    configs[plugin] = config_plugin
  }
  return configs
}

const deconstructView = (view, yaml) => {
  let viewData = []
  for (let config of view) {
    let value

    if (config.default === undefined || config.default === null){
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
      value: value
    })

  }
  return viewData
}

const getPluginView = (plugin) => {
  const configFile = `plugins/${plugin}/config/PluginConfigView.yaml`
  let pluginConfigData = {}
  if (fs.existsSync(configFile)) {
    const yamlEditor = new YamlEditor(configFile)
    const yamlData = yamlEditor.get()
    for (const config of yamlData) {
      const pluginFileNamePath = path.parse(config.file)
      const fileYaml = new YamlEditor(`plugins/${plugin}/config/config/${config.file}`)
      let viewData = deconstructView(config.view, fileYaml)
      pluginConfigData[pluginFileNamePath.name] = viewData
    }
  }
  return pluginConfigData
}

const getPluginConfig = (plugin) => {
  const plugins = getPluginsList()
  if (!plugins.includes(plugin)) {
    return {}
  }
  let configs = {}
  const configPath = `plugins/${plugin}/config/config/`
  if (fs.existsSync(configPath)) {
    // 如果有视图配置文件，直接返回视图规定的配置信息
    if (fs.existsSync(`plugins/${plugin}/config/PluginConfigView.yaml`)) {
      return getPluginView(plugin)
    }
    const yamlFiles = fs.readdirSync(configPath).filter(file => file.endsWith('.yaml'))
    for (const cfg of yamlFiles) {
      const yamlContent = new YamlEditor(path.join(configPath, cfg))
      let current = yamlContent.document.contents
      let pluginCfg = []
      for (let pair of current.items) {
        pluginCfg = [...pluginCfg, ...deconstruct(pair)]
      }
      configs[path.parse(cfg).name] = pluginCfg
    }
  }
  return configs
}

const setPluginConfig = (plugin, file, key, value) => {
  const plugins = getPluginsList()
  if (!plugins.includes(plugin)) {
    return
  }
  const configPath = `plugins/${plugin}/config/config/`
  if (fs.existsSync(configPath)) {
    const yamlFile = path.join(configPath, file + '.yaml')
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
      } else if (Config.Config.append) {
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
}

export {
  getPluginConfig,
  getAllPluginConfig,
  getPluginsList,
  setPluginConfig
}


