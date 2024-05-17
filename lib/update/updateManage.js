import { exec } from '#Karin'

const checkGit = async () => {
  try {
    const ret = await exec('git --version', { encoding: 'utf-8' })
    return ret.ok || !ret.stdout.includes('git version')
  } catch (error) {
    return false
  }
}

const checkGitStatus = async (callback) => {
  try {
    // 定义一个对象来存储所有信息
    const status = {
      currentBranch: '',
      remoteBranch: '',
      hasUncommittedChanges: false,
      commitsBehind: 0,
      commitsAhead: [],
    }

    // 获取当前分支名称
    const { stdout: currentBranchStdout } = await exec('git rev-parse --abbrev-ref HEAD')
    status.currentBranch = currentBranchStdout.trim()

    // 检查是否有未提交的更改
    const { stdout: statusStdout } = await exec('git status --porcelain')
    status.hasUncommittedChanges = statusStdout.length > 0

    // 获取当前分支与远程分支的差异
    const { stdout: revListStdout } = await exec(`git rev-list --left-right --count ${status.currentBranch}...origin/${status.currentBranch}`)
    const [behind, ahead] = revListStdout.trim().split('\t').map(Number)
    status.commitsBehind = behind

    // 获取当前分支之后的提交信息
    const { stdout: logStdout } = await exec(`git log origin/${status.currentBranch}..${status.currentBranch} --oneline`)
    status.commitsAhead = logStdout.trim().split('\n').map(commit => {
      const [hash, ...message] = commit.trim().split(' ')
      return { hash, message: message.join(' ') }
    })

    return status
  } catch (error) {
    throw error // 或者根据您的需要处理错误
  }
}

const checkForUpdates = async () => {
  try {
    // 检查是否有未提交的更改
    const { stdout: statusStdout } = await exec('git status --porcelain')
    if (statusStdout.length > 0) {
      // 如果有未提交的更改，则返回 false
      return false
    }

    // 获取当前分支名称
    const { stdout: currentBranchStdout } = await exec('git rev-parse --abbrev-ref HEAD')
    const currentBranch = currentBranchStdout.trim()

    // 获取当前分支与远程分支的差异
    const { stdout: revListStdout } = await exec(`git rev-list --left-right --count ${currentBranch}...origin/${currentBranch}`)
    const [behind] = revListStdout.trim().split('\t').map(Number)
    return behind > 0
  } catch (error) {
    console.error('检查更新时发生错误:', error)
    throw error // 或者根据您的需要处理错误
  }
}

const backupUncommittedFiles = async (backupPath) => {
  // 创建备份目录
  fs.mkdirSync(backupPath, { recursive: true })

  // 获取未提交的文件列表
  const { stdout } = await exec('git status --porcelain')
  const files = stdout.split('\n').filter(line => line).map(line => line.slice(3))

  // 复制每个未提交的文件到备份目录
  for (const file of files) {
    const filePath = path.join(backupPath, file)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.copyFileSync(file, filePath)
  }
}

const pullUpdates = async (forceUpdate = false) => {
  let result = {
    success: false,
    output: '',
  };

  try {
    // 检查是否有未提交的更改
    const { stdout: statusStdout } = await exec('git status --porcelain');
    const hasUncommittedChanges = statusStdout.length > 0;

    if (forceUpdate && hasUncommittedChanges) {
      // 如果强制更新且有未提交的更改，则备份未提交的文件
      const backupPath = `./backups/${new Date().toISOString()}`;
      await backupUncommittedFiles(backupPath);
      result.backup = backupPath
      // 放弃未提交的更改
      await exec('git reset --hard');
    }

    // 拉取更新
    const gitStd = await exec('git pull');
    result.success = gitStd.ok;
    console.log(gitStd)
    result.output = gitStd.ok ? gitStd.stdout : gitStd.error

    return result;
  } catch (error) {
    console.error('拉取更新时发生错误:', error);
    result.output = error.message;
    return result;
  }
}

export {
  checkGit,
  checkGitStatus,
  checkForUpdates,
  pullUpdates
}


