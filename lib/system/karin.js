import { Renderer } from '#Karin'
import loader from '../../../../lib/plugins/loader.js'
import lodash from 'lodash'
import fs from 'fs'
import path from 'path'

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

const parseLogData = (logData, numRecords = null, filterLevel = '') => {
  const ansiEscapeRegex = /\x1B\[[0-?]*[ -/]*[@-~]/g
   const logRegex = /(\[\d{2}:\d{2}:\d{2}\.\d{3}\])\[(\w+)\] (.+?)(?=\[\d{2}:\d{2}:\d{2}\.\d{3}\]\[\w+\] |$)/gs
  logData = logData.replace(ansiEscapeRegex, '')
   const records = []
   let match

   while ((match = logRegex.exec(logData)) !== null) {
    if (filterLevel && match[2] !== filterLevel) {
      continue
    }
     records.push({
       timestamp: match[1],
       level: match[2],
       message: match[3].trim()
     })
   }

   if (numRecords !== null && numRecords > 0) {
     return records.slice(-numRecords)
   }

   return records
}

const getLogs = (numRecords, filterLevel) => {
  const logsDir = path.resolve('logs/')
  const files = fs.readdirSync(logsDir)
  const logFileRegex = /logger\.\d{4}-\d{2}-\d{2}\.log$/
  const sortedFiles = files.filter(file => logFileRegex.test(file)).sort().reverse()
  const latestLogFile = sortedFiles[0]
  if (latestLogFile) {
    const latestLogPath = path.join(logsDir, latestLogFile)
    const data = fs.readFileSync(latestLogPath, 'utf8')
    return parseLogData(data, numRecords, filterLevel)
  } else {
    throw new Error('没有找到日志文件。')
  }
}

export {
  getRendererList,
  getPluginsAppList,
  getLogs
}


