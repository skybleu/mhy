import fs from 'fs'
import path from 'path'
import { addPath, addAliases } from 'module-alias'
import mhyConfig from '@/configs/mhy'
import swcConfig from '@/configs/swc'
import register from '@swc/register'
import BuiltinModule from 'module'

// Expose mhy config as Global (just like with webpack)
global.mhy = mhyConfig

// Guard against poorly mocked module constructors
const Module = module.constructor.length > 1 ? module.constructor : BuiltinModule

swcConfig.extensions = ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx']
swcConfig.module = {
    type: 'commonjs'
}

register(swcConfig)
addPath(path.resolve(process.cwd(), 'node_modules'))

const nodeModulesPath = path.resolve(__dirname, '../../')
addPath(nodeModulesPath)

const oldResolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, parentModule, isMain, options) {
    if (!parentModule.paths.includes(nodeModulesPath)) {
        parentModule.paths.push(nodeModulesPath)
    }
    return oldResolveFilename.call(this, request, parentModule, isMain, options)
}

const oldNodeModulePaths = Module._nodeModulePaths
Module._nodeModulePaths = function (from) {
    const paths = oldNodeModulePaths.call(this, from)

    if (!paths.includes(nodeModulesPath)) {
        paths.push(nodeModulesPath)
    }

    return paths
}

const alias = { ...mhyConfig.defaultAliases }
for (const [key, entry] of Object.entries(alias)) {
    if (!fs.existsSync(entry)) {
        alias[key] = path.resolve(process.cwd(), entry)
    } else {
        // Make sure it's a resolved path indeed
        alias[key] = path.resolve(entry)
    }
}
addAliases(alias)

const scriptKey = '--mhy-script'
const scriptIndex = process.argv.findIndex(v => v.includes(scriptKey))
const scriptValue = process.argv[scriptIndex]
const src =
    scriptValue.length === scriptKey.length ? process.argv[scriptIndex + 1] : scriptValue.replace(`${scriptKey}=`, '')

// Remove them
process.argv.splice(scriptIndex, 2)

if (src) {
    require(path.resolve(process.cwd(), src))
}
