import { YamlEditor } from '#Karin'
import loader from '../../../../lib/plugins/loader.js'
import fs from 'fs'
import path from 'path'
import Yaml from 'yaml'

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
    } else {
      console.log(pair)
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
const getAllPluginConfig = () => {
  const plugins = getPluginsList()
  let configs = {}
  for (const plugin of plugins) {
    let config_plugin = {}
    console.log(`读取${plugin}插件配置文件`)
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

const getPluginConfig = (plugin) => {
  const plugins = getPluginsList()
  if (!plugins.includes(plugin)) {
    return {}
  }
  let configs = {}
  console.log(`读取${plugin}插件配置文件`)
  const configPath = `plugins/${plugin}/config/config/`
  if (fs.existsSync(configPath)) {
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
      console.log(`设置：${yamlFile}`)
      if (yamlEditor.has(key)) {
        const oleValue = yamlEditor.get(key)
        yamlEditor.set(key, value)
        yamlEditor.save()
        return {
          plugin, file, key,
          value: oleValue, change: value
        }
      } else {
        return
      }
    } catch (error) {
      console.error(error)
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


