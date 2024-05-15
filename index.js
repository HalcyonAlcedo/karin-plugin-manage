import path from 'path'
import { logger, common, Cfg, plugin  } from '#Karin'
import packageConfig from './package.json' assert { type: 'json' }

/** 当前文件的绝对路径 */
const filePath = common.absPath(import.meta.url.replace(/^file:(\/\/\/|\/\/)/, ''))
/** 插件包的目录路径 */
const dirname = path.dirname(filePath)
/** 插件包的名称 */
const basename = packageConfig.name
/** 插件包的版本 */
const version = packageConfig.version
/** 插件包相对路径 */
const dirPath = './plugins/' + basename

export { dirPath }

logger.info(`${basename}插件 ${version} 初始化~`)
