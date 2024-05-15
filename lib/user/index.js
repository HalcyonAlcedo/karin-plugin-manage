import { Cfg } from '#Karin'
import UserManager from './userManager.js'
import manageCfg from '../config.js'

const manageConfig = manageCfg.getConfig('config')
const karinConfig = Cfg

/**
 * 自动生成管理账号
 * 为每个机器人自动生成管理账号，用户名为机器人qq号，密码随机生成
 */
if (manageConfig?.autoAdminAccount) {
  // 待补充
}

export {
  UserManager
}
