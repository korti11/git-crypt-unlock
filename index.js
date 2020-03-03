const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const os = require('os');
const fs = require('fs');

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
        await tc.downloadTool('https://github.com/oholovko/git-crypt-windows/releases/download/1.0.35/git-crypt.exe', `${exePath}\\git-crypt.exe`);
        break;
      default:
        // Should never be thrown on github workflows.
        throw new Error(`OS: ${osType} not supported. What did you do this should never happened :O`);
    }

    let buffer = Buffer.from(key, 'base64');
    let secreteFile = 'secrete-key.key';
    fs.writeFileSync(secreteFile, buffer);

    await exec.exec('git-crypt unlock ./secrete-key.key');

    fs.unlinkSync(secreteFile);
    core.info('Secrets unlocked.');
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
