const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');
const os = require('os');
const fs = require('fs');
const https = require('https');
const exe = require('child_process/exec');

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
        await exec.exec('sudo apt-get update');
        await exec.exec('sudo apt-get install -y git-crypt');
        break;
      case 'Windows_NT':
        const file = fs.createWriteStream('git-crypt.exe');
        https.get("https://github.com/oholovko/git-crypt-windows/releases/download/1.0.35/git-crypt.exe", (response) => {
          response.pipe(file);
        });
        break;
      default:
        // Should never be thrown on github workflows.
        throw new Error(`OS: ${osType} not supported. What did you do this should never happened :O`);
    }

    if(!key) {
      throw new Error('Key is empty!');
    }

    let buffer = Buffer.from(key, 'base64');
    fs.writeFileSync('secrete-key.key', buffer);

    if(osType == 'Windows_NT') {
      await exe('git-crypt.exe unlock ./secrete-key.key', (err, stdout, stderr) => {
        if(err) {
          throw new Error(err);
        }
      });
    } else {
      await exec.exec('git-crypt unlock ./secrete-key.key');
    }

    if(osType == 'Windows_NT') {
      io.rmRF('./git-crypt.exe');
      io.rmRF('./secrete-key.key');
    }

    core.info('Secrets unlocked.');
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
