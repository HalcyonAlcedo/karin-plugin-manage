import fs from 'fs'
import path from 'path'
import { YamlEditor, logger, config as Cfg } from 'node-karin'
import { config } from '@plugin/imports'

/**
* 获取Karin配置列表
* @returns {array} 配置列表
*/
export function getKarinConfigList () {
  const configs = []
  if (fs.existsSync('config/config/')) {
    const yamlFiles = fs.readdirSync('config/config/').filter(file => file.endsWith('.yaml'))
    for (const cfg of yamlFiles) {
      configs.push(path.parse(cfg).name)
    }
  }
  return configs
}

interface View {
  key: string
  comment: string
  path: string
  type: string
  arrayType: string
  item: { name: string, value: string }[]
  multiple: boolean
  prefix: string
  suffix: string
  value: any
}

function deconstruct (pair: any, yamlPath: string = ''): any[] {
  if (pair.constructor.name != 'Pair') {
    return [pair.value || pair]
  }
  yamlPath = pair.key ? `${yamlPath}${yamlPath ? '.' : ''}${pair.key.value}` : ''
  const configData = []
  let configValue: any[] | string | null | undefined
  if (pair.value.items) {
    configValue = []
    for (const pairData of pair.value.items) {
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
      path: yamlPath,
    }
  )
  return configData
}

function getKarinAssociated (view: any[], file: string): any[] {
  let associated: any[] = []
  for (const config of view) {
    if (config.type === 'group' && config.part) {
      associated = [...associated, ...getKarinAssociated(config.part, file)]
    } else if (config.associated && Array.isArray(config.associated)) {
      for (const item of config.associated) {
        const associatedFile = item.file || file
        const karinConfig = new YamlEditor(path.join('config/config/', associatedFile + '.yaml'))
        const karinDefaultConfig = new YamlEditor(path.join(Cfg.pkgCfgDir, associatedFile + '.yaml'))
        associated.push({
          config: config.path,
          target: {
            file: associatedFile,
            path: item.path,
            value: karinConfig.get(item.path) || karinDefaultConfig.get(item.path),
            expected: item.requirement,
          },
        })
      }
    }
  }
  return associated
}

function deconstructView (view: any[], yaml: YamlEditor) {
  const viewData: View[] = []
  for (const config of view) {
    let value

    if (config.default === undefined || config.default === null) {
      switch (config.type) {
        case 'text':
          config.default = ''
          break
        case 'url':
          config.default = ''
          break
        case 'boolean':
          config.default = false
          break
        default:
          config.default = ''
          break
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
      arrayType: config.arrayType,
      item: config.item,
      multiple: config.multiple,
      prefix: config.prefix,
      suffix: config.suffix,
      value,
    })
  }
  return viewData
}

function getKarinView (file: string) {
  const configFile = path.join(Cfg.pkgDir,'config/view/', file + '.yaml')
  let karinConfigData = {}
  let view
  let associated
  if (fs.existsSync(configFile)) {
    const yamlEditor = new YamlEditor(configFile)
    const yamlData = yamlEditor.get('')
    view = yamlData
    const fileYaml = new YamlEditor(`config/config/${file}.yaml`)
    const viewData = deconstructView(yamlData.view, fileYaml)
    associated = getKarinAssociated(yamlData.view, file)
    karinConfigData = viewData
  }
  return { config: karinConfigData, view, associated }
}

/**
* 获取Karin配置
* @param {string} file 配置文件名
* @returns {object} 配置信息
*/
export function getKarinConfig (file: string): { config: any } | { config: any, view: any, associated: any } {
  if (fs.existsSync(path.join(Cfg.pkgDir,'config/view/', file + '.yaml'))) {
    return getKarinView(file)
  }
  const karinConfig = new YamlEditor(path.join('config/config/', file + '.yaml'))
  const karinDefaultConfig = new YamlEditor(path.join(Cfg.pkgCfgDir, file + '.yaml'))
  const current: any = { ...karinDefaultConfig, ...karinConfig }.document.contents
  let configs: any[] = []
  for (const pair of current.items) {
    configs = [...configs, ...deconstruct(pair)]
  }
  return { config: configs }
}

/**
* 设置Karin配置
* @param {string} file 配置文件名
* @param {string} key 配置路径
* @param {string | boolean} file 配置值
* @returns {object|undefined} 变动项
*/
export function setKarinConfig (file: string, key: string, value: string | boolean) {
  const files = getKarinConfigList()
  if (!files.includes(file)) {
    return
  }
  const yamlFile = path.join('config/config/', file + '.yaml')
  try {
    const yamlEditor = new YamlEditor(yamlFile)
    logger.info(`设置：${yamlFile}`)
    if (yamlEditor.has(key)) {
      const oleValue = yamlEditor.get(key)
      yamlEditor.set(key, value)
      yamlEditor.save()
      return {
        file,
        key,
        value: oleValue,
        change: value,
      }
    } else if (config.Config.append) {
      yamlEditor.set(key, value)
      yamlEditor.save()
      return {
        file,
        key,
        value: null,
        change: value,
      }
    }
  } catch (error) {
    logger.error(error)
  }
}
