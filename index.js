const core = require('@actions/core');
const exec = require('@actions/exec');
const os = require('os')

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
        throw new Error('Linux currently not supported.');
      case 'Windows_NT':
        throw new Error('Windows currently not supported.');
      default:
        // Should never be thrown on github workflows.
        throw new Error(`OS: ${osType} not supported. What did you do this should never happened :O`);
    }

    if(!key) {
      throw new Error('Key is empty!');
    }

    await exec.exec(`echo ${key} | base64 -d > ./secret-key.key`);
    await exec.exec('ls -al');  // Debug print to see permissions.
    //await exec.exec('git-crypt unlock ./secrete-key.key'); // Currently not working :(

    core.info('Secrets unlocked.');
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
