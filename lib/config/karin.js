import { YamlEditor, logger } from '#Karin'
import fs from 'fs'
import path from 'path'

const getKarinConfigList = () => {
  let configs = []
  if (fs.existsSync('config/config/')) {
    const yamlFiles = fs.readdirSync('config/config/').filter(file => file.endsWith('.yaml'))
    for (const cfg of yamlFiles) {
      configs.push(path.parse(cfg).name)
    }
  }
  return configs
}

const deconstruct = (pair, yamlPath = '') => {
  if (pair.constructor.name != 'Pair') {
    return [pair.value || pair]
  }
  yamlPath = pair.key ? `${yamlPath}${yamlPath ? '.' : ''}${pair.key.value}` : ''
  let configData = []
  let configValue
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

const getKarinAssociated = (view, file) => {
  let associated = []
  for (const config of view) {
    if (config.type === 'group' && config.part) {
      associated = [...associated, ...getKarinAssociated(config.part, file)]
    } else if (config.associated && Array.isArray(config.associated)) {
      for (const item of config.associated) {
        const associatedFile = item.file || file
        const karinConfig = new YamlEditor(path.join('config/config/', associatedFile + '.yaml'))
        const karinDefaultConfig = new YamlEditor(path.join('config/defSet/', associatedFile + '.yaml'))
        associated.push({
          config: config.path,
          target: {
            file: associatedFile,
            path: item.path,
            value: karinConfig.get(item.path) || karinDefaultConfig.get(item.path),
            expected: item.requirement
          }
        })
      }
    }
  }
  return associated
}

const deconstructView = (view, yaml) => {
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
      arrayType: config.arrayType,
      item: config.item,
      multiple: config.multiple,
      prefix: config.prefix,
      suffix: config.suffix,
      value: value
    })

  }
  return viewData
}

const getKarinView = (file) => {
  const configFile = `config/view/${file}.yaml`
  let karinConfigData = {}
  let view
  let associated
  if (fs.existsSync(configFile)) {
    const yamlEditor = new YamlEditor(configFile)
    const yamlData = yamlEditor.get()
    view = yamlData
    const fileYaml = new YamlEditor(`config/config/${file}.yaml`)
    let viewData = deconstructView(yamlData.view, fileYaml)
    associated = getKarinAssociated(yamlData.view, file)
    karinConfigData = viewData
  }
  return { config: karinConfigData, view, associated }
}

const getKarinConfig = (file) => {
  if (fs.existsSync(`config/view/${file}.yaml`)) {
    return getKarinView(file)
  }
  const karinConfig = new YamlEditor(path.join('config/config/', file + '.yaml'))
  const karinDefaultConfig = new YamlEditor(path.join('config/defSet/', file + '.yaml'))
  let current = { ...karinDefaultConfig, ...karinConfig }.document.contents
  let configs = []
  for (let pair of current.items) {
    configs = [...configs, ...deconstruct(pair)]
  }
  return { config: configs }
}

const setKarinConfig = (file, key, value) => {
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
        file, key,
        value: oleValue, change: value
      }
    } else if (Config.Config.append) {
      yamlEditor.set(key, value)
      yamlEditor.save()
      return {
        file, key,
        value: null, change: value
      }
    } else {
      return
    }
  } catch (error) {
    logger.error(error)
    return
  }

}

export {
  getKarinConfigList,
  getKarinConfig,
  setKarinConfig
}


