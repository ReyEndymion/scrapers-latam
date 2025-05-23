const fs = require('fs')
const path = require('path')

const { promisify } = require('util')
const fsAccess = promisify(fs.access)

const fileExists = async (filePath) =>
  fsAccess(filePath)
    .then(() => true)
    .catch(() => false)

const cwd = process.cwd()
const libPath = path.join(cwd, './lib')

async function writePackageJson() {
  const libExists = await fileExists(libPath)
  if (!libExists) {
    console.error('@ReyEndymion/scraper:', 'Carpeta lib no encontrada después de compilar a TypeScript')
    process.exit(1)
  }
  console.log('@ReyEndymion/scraper:', 'Escribir archivo \'package.json\'...')

  const libCjs = path.join(libPath, 'cjs')
  const libCjsExists = await fileExists(libCjs)
  if (libCjsExists) {
    const packageJson = JSON.stringify({ type: 'commonjs' }, null, 2)
    await fs.promises.writeFile(path.join(libCjs, 'package.json'), packageJson)
  } else console.warn('@ReyEndymion/scraper:', 'Carpeta CJS no encontrada')
  const libEsm = path.join(libPath, 'esm')
  const libEsmExists = await fileExists(libEsm)
  if (libEsmExists) {
    const packageJson = JSON.stringify({ type: 'module' }, null, 2)
    await fs.promises.writeFile(path.join(libEsm, 'package.json'), packageJson)
  } else console.warn('@ReyEndymion/scraper:', 'Carpeta ESM no se encuentra')

  const typesPath = path.join(libPath, '@types')
  const typesExists = await fileExists(typesPath)

  if (!typesExists && !libEsmExists && !libCjsExists) {
    console.error('@ReyEndymion/scraper:', 'No se encontraron archivos de TypeScript compilados')
    process.exit(1)
  }
}

if (require.main === module) writePackageJson()
