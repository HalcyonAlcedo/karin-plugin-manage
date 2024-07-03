import path from 'path'
import { fileURLToPath } from 'url'

/** 当前文件的绝对路径 */
const filePath: string = fileURLToPath(import.meta.url).replace(/\\/g, '/')
/** 插件包的目录路径 */
const dirname: string = path.resolve(filePath, '../../../')
/** 插件包的名称 */
const basename: string = path.basename(dirname)
/** 插件包相对路径 */
const dirPath: string = './plugins/' + basename

export { dirPath, dirname, basename }
