const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');
const tc = require('@actions/tool-cache');
const os = require('os');
const fs = require('fs');
// const https = require('https');
// const cp = require('child_process');

// most @actions toolkit packages have async methods
async function run() {
  try { 
    const key = core.getInput('GIT_CRYPT_KEY');
    const osType = os.type();

    if(!key) {
      throw new Error('Key is empty!');
    }

    switch(osType) {
      case 'Darwin':
        await exec.exec('brew install git-crypt');
        break;
      case 'Linux':
        await exec.exec('sudo apt-get update');
        await exec.exec('sudo apt-get install -y git-crypt');
        break;
      case 'Windows_NT':
        let exePath = process.cwd();
        exePath = exePath.substring(0, exePath.lastIndexOf('\\') + 1) + 'git-crypt';
        process.env.PATH += `;${exePath}`;
        core.info(exePath);
        const gitCryptPath = await tc.downloadTool('https://github.com/oholovko/git-crypt-windows/releases/download/1.0.35/git-crypt.exe', `${exePath}\\git-crypt.exe`);
        core.info(`Git crypt path ${gitCryptPath}`);
        break;
      default:
        // Should never be thrown on github workflows.
        throw new Error(`OS: ${osType} not supported. What did you do this should never happened :O`);
    }

    let buffer = Buffer.from(key, 'base64');
    fs.writeFileSync('secrete-key.key', buffer);

    await exec.exec('git-crypt unlock ./secrete-key.key');

    core.info('Secrets unlocked.');
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

async function unlockWindows() {

}

async function unlock() {

}

run()
