// Source: https://github.com/puppeteer/puppeteer/blob/main/typescript-if-required.js

const child_process = require('child_process')
// const fs = require('fs')
// const path = require('path')

const { promisify } = require('util')
const exec = promisify(child_process.exec)
// const fsAccess = promisify(fs.access)

// const fileExists = async (filePath) =>
//   fsAccess(filePath)
//     .then(() => true)
//     .catch(() => false)

// const cwd = process.cwd()
// const libPath = path.join(cwd, './lib')

async function compileTypeScript() {
  const out = await exec('npm run build').catch((error) => {
    console.error('@ReyEndymion/scraper:', 'Error en ejecución de TypeScript\n', error)
    process.exit(1)
  })
  if (out.stdout.trim()) console.log(out.stdout)
  if (out.stderr.trim()) console.error(out.stderr)
}

async function compileTypeScriptIfRequired() {
  // const typesPath = path.join(libPath, '@types')
  // const libExists = await fileExists(libPath)
  // const typesExists = await fileExists(typesPath)
  // if (libExists && typesExists) return

  console.log('@ReyEndymion/scraper:', 'Compilación de TypeScript...')
  await compileTypeScript()
}

if (require.main === module) compileTypeScriptIfRequired()
