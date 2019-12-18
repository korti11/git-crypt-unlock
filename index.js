const core = require('@actions/core');
const exec = require('@actions/exec');
const os = require('os');
const fs = require('fs');

// most @actions toolkit packages have async methods
async function run() {
  try { 
    const key = core.getInput('GIT_CRYPT_KEY');
    const osType = os.type();

    switch(osType) {
      case 'Darwin':
        await exec.exec('brew install git-crypt');
        break;
      case 'Linux':
        await exec.exec('apt-get update && apt-get install -y git-crypt');
        break;
      case 'Windows_NT':
        throw new Error('Windows currently not supported.');
      default:
        // Should never be thrown on github workflows.
        throw new Error(`OS: ${osType} not supported. What did you do this should never happened :O`);
    }

    if(!key) {
      throw new Error('Key is empty!');
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

run()
