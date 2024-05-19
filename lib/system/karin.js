import { Renderer } from '#Karin'
import loader from '../../../../lib/plugins/loader.js'
import lodash from 'lodash'

const getPluginsAppList = () => {
  let apps = lodash.cloneDeep(loader.Apps)
  apps = apps.map(item => {
    if (item.rule && Array.isArray(item.rule)) {
      item.rule = item.rule.map(rule => {
        if (rule.reg) {
          rule.reg = rule.reg.toString()
        }
        return rule
      })
    }
    return item
  })
  return apps
}

const getRendererList = async () => {
  return Renderer.Apps
}

export {
  getRendererList,
  getPluginsAppList
}


