# Git Crypt Unlock

This action allows you to decrypt files that were encrypted by [git-crypt](https://github.com/AGWA/git-crypt).
Currently only MacOS is supported. For Linux use the [github-action-git-crypt-unlock](https://github.com/sliteteam/github-action-git-crypt-unlock) and for you windows folks I'm sorry the support has to wait for another time. To clarify that has nothing to do with your local machine os but rather with the os you run your workflow job on.

## Usage

### 1. Setup
Setup your repository accordingly to git-crypt so you can encrypt your secret files.

### 2. Base64 Key
Export your key and encoded it in base64.
```bash
git-crypt export-key ./tmp-key && cat ./tmp-key | base64 > super-secret-key-in-base64.txt
```
Use whatever file name you want but remember it. Open the file and copy it's content and past it in a secret variable in your target repository.

### 3. Create workflow

Create a new workflow `.yml` file in the `.github/workflows/` folder. In this new created file you have to write the following base steps in the same order.

```yml
name: Unlock your super secret content

on: push

jobs:
  unlock-secrets:
    runs-on: macOS-latest
    steps:
    - uses: actions/checkout@v1
    - uses: korti11/git-crypt-unlock@v0.1
      with:
        GIT_CRYPT_KEY: ${{secrets.GIT_CRYPT_KEY}}
```
After the usage of git-crypt-unlock you can do with your files whatever you want.

### Options

#### GIT_CRYPT_KEY
Your key encoded in base64.