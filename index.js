'use strict'

const util = require('util')

const babel = require('babel-core')
const browserify = require('browserify')
const cjsResolve = require('rollup-plugin-commonjs')
// const figgyPudding = require('figgy-pudding')
const fs = require('fs')
const glob = util.promisify(require('glob'))
const os = require('os')
const pacote = require('pacote')
const path = require('path')
const rimraf = util.promisify(require('rimraf'))
const rollup = require('rollup')
const uniqueFilename = require('unique-filename')
const zlib = require('zlib')

const gzipAsync = util.promisify(zlib.gzip)
const statAsync = util.promisify(fs.stat)

module.exports = pkgStats

// const LiftConfig = figgyPudding({
//   tmpdir: {}
// })

async function pkgStats (pkg, opts) {
  // opts = LiftConfig(opts)
  opts = opts || {}
  const stats = {}
  const pkgDir = uniqueFilename(opts.tmpdir || os.tmpdir())
  const startTime = Date.now()
  try {
    await pacote.extract(pkg, pkgDir, opts)
    stats.unpackedSize = await getSize('**/*', pkgDir)
    const bundle = await bundlePackage(pkgDir)
    stats.bundleSize = Buffer.from(bundle.code, 'utf8').length
    const minifyResult = babel.transform(bundle.code, {
      presets: ['minify']
    })
    const minified = Buffer.from(minifyResult.code, 'utf8')
    stats.minifiedBundleSize = minified.length
    stats.gzippedBundleSize = (await gzipAsync(bundle.code)).length
    stats.gzippedMinifiedBundleSize = (await gzipAsync(minified)).length
  } finally {
    await rimraf(pkgDir)
  }
  stats.bundleTime = Date.now() - startTime
  return stats
}

async function getSize (str, cwd) {
  const files = await glob(str, {cwd})
  const stats = await Promise.all(files.map(f => statAsync(path.join(cwd, f))))
  return stats.reduce((acc, stat) => {
    if (stat.isFile()) {
      return acc + stat.size
    } else {
      return acc
    }
  }, 0)
}

async function bundlePackage (pkgDir) {
  const pkgJson = require(path.join(pkgDir, 'package.json'))
  const entry = path.join(pkgDir, pkgJson.main || pkgJson.module || 'index.js')
  try {
    return await (await rollup.rollup({
      input: entry,
      onwarn: () => {},
      plugins: [
        cjsResolve({
          ignoreGlobal: false,
          sourceMap: true,
          exclude: ['node_modules/**'] // no deps -- just this one
        })
      ]
    })).generate({name: pkgJson.name, format: 'umd'})
  } catch (rollupError) {
    const b = browserify(entry, {
      bare: true,
      bundleExternal: false,
      ignoreMissing: true
    })
    try {
      return await new Promise((resolve, reject) => {
        b.bundle((err, buf) => {
          if (err) {
            reject(err)
          } else {
            resolve({code: buf, map: ''})
          }
        })
      })
    } catch (browserifyError) {
      throw Object.assign(
        new Error(
          `Bundle could not be built. All bundlers failed.\nRollup Error: ${rollupError.message}\nBrowserify Error: ${browserifyError.message}`
        ), {
          browserifyError,
          rollupError
        }
      )
    }
  }
}
