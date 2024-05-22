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

const parseLogData = (logData, numRecords = null, filterLevel = '', lastTimestamp = '') => {
  const ansiEscapeRegex = /\x1B\[[0-?]*[ -/]*[@-~]/g
  const logRegex = /(\[\d{2}:\d{2}:\d{2}\.\d{3}\])\[(\w+)\] (.+?)(?=\[\d{2}:\d{2}:\d{2}\.\d{3}\]\[\w+\] |$)/gs
  logData = logData.replace(ansiEscapeRegex, '')
  const records = []
  let match
  const cleanLastTimestamp = lastTimestamp.replace(/[\[\]]/g, '');
  const lastTimeValue = cleanLastTimestamp ? new Date('1970-01-01T' + cleanLastTimestamp + 'Z').getTime() : null;
  while ((match = logRegex.exec(logData)) !== null) {
    const timestamp = match[1]
    const level = match[2]
    const message = match[3].trim()

    const cleanTimestamp = timestamp.replace(/[\[\]]/g, '');
    const timeValue = cleanTimestamp ? new Date('1970-01-01T' + cleanTimestamp + 'Z').getTime() : null;
    if (numRecords >= 0) {
      if (lastTimeValue && timeValue <= lastTimeValue) {
        continue
      }
    } else {
      if (lastTimeValue && timeValue > lastTimeValue) {
        continue
      }
    }
    if (filterLevel && level !== filterLevel) {
      continue
    }
    records.push({
      timestamp,
      level,
      message
    })
  }

  records.reverse()

  if (numRecords === null) {
    return records
  }

  if (typeof numRecords === 'string') {
    numRecords = Number(numRecords)
  }

  if (typeof numRecords === 'number') {
    if (numRecords >= 0) {
      return records.slice(0, numRecords)
    } else {
      return records.slice(0, -numRecords)
    }
  }

  if (Array.isArray(numRecords) && numRecords.length === 2) {
    return records.slice(numRecords[0], numRecords[1])
  }

  if (typeof numRecords === 'object' && numRecords !== null) {
    const { number, index } = numRecords
    if (typeof number === 'number' && typeof index === 'number') {
      return records.slice(index, number)
    }
  }

  return records
}


const getLogs = (numRecords, filterLevel, lastTimestamp) => {
  const logsDir = path.resolve('logs/')
  const files = fs.readdirSync(logsDir)
  const logFileRegex = /logger\.\d{4}-\d{2}-\d{2}\.log$/
  const sortedFiles = files.filter(file => logFileRegex.test(file)).sort().reverse()
  const latestLogFile = sortedFiles[0]
  if (latestLogFile) {
    const latestLogPath = path.join(logsDir, latestLogFile)
    const data = fs.readFileSync(latestLogPath, 'utf8')
    if (filterLevel === 'ALL') {
      filterLevel = ''
    }
    return parseLogData(data, numRecords, filterLevel, lastTimestamp)
  } else {
    throw new Error('没有找到日志文件。')
  }
}

export {
  getRendererList,
  getPluginsAppList,
  getLogs
}


