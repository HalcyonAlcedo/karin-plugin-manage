import { YamlEditor } from '#Karin'
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
const getKarinConfig = (file) => {
  const karinConfig = new YamlEditor(path.join('config/config/', file + '.yaml'))
  let current = karinConfig.document.contents
  let configs = []
  for (let pair of current.items) {
    configs = [...configs, ...deconstruct(pair)]
  }
  return configs
}

const setKarinConfig = (file, key, value) => {
  const files = getKarinConfigList()
  if (!files.includes(file)) {
    return
  }
  const yamlFile = path.join('config/config/', file + '.yaml')
  try {
    const yamlEditor = new YamlEditor(yamlFile)
    console.log(`设置：${yamlFile}`)
    if (yamlEditor.has(key)) {
      const oleValue = yamlEditor.get(key)
      yamlEditor.set(key, value)
      yamlEditor.save()
      return {
        file, key,
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

export {
  getKarinConfigList,
  getKarinConfig,
  setKarinConfig
}


