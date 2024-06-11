import { spawn, exec } from 'child_process'
import os from 'os'
import path from 'path'
import fs from 'fs'

export function executeCommand(command, args, ws, workingDirectory = './') {

  const isWindows = os.platform() === 'win32';
  const shell = isWindows ? 'powershell.exe' : true;

  if (isWindows) {
    exec('chcp 65001')
  }

  // 处理目录移动
  if (command === 'cd') {
    const directory = path.join(workingDirectory, args[0] || '')
    if (fs.existsSync(directory)) {
      ws.send(JSON.stringify({ type: 'directory', content: path.resolve(directory), origin: {command, args} }))
      ws.send(JSON.stringify({ type: 'close', content: `进程退出码: 0`, origin: {command, args} }))
      return null
    }
  }

  const process = spawn(command, args, {
    cwd: workingDirectory,
    shell: shell,
    encoding: 'utf-8'
  })

  process.stdout.on('data', (data) => {
    ws.send(JSON.stringify({ type: 'output', content: data.toString(), origin: {command, args} }))
  })

  process.stderr.on('data', (data) => {
    ws.send(JSON.stringify({ type: 'error', content: data.toString(), origin: {command, args} }))
  })

  process.on('error', (error) => {
    ws.send(JSON.stringify({ type: 'error', content: `Error: ${error.message}`, origin: {command, args} }))
  })

  process.on('close', (code) => {
    ws.send(JSON.stringify({ type: 'close', content: `进程退出码: ${code}`, origin: {command, args} }))
  })

  return process
}
