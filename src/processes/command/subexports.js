import path from 'path'
import yargs from 'yargs'
import fse from 'fs-extra'
import { loadConfig } from '@/utils'

const commandHandler = () => {
    const args = loadConfig('subexports')
    const root = fse.readJsonSync('./package.json').name

    Object.entries(args)
        .filter(([pkg, options]) => {
            const isExists = fse.existsSync(path.resolve(process.cwd(), options.main))
            !isExists && console.error(`could not find dist for ${pkg} package`)
            return isExists
        })
        .forEach(([pkg, options]) => {
            const pkgFolder = path.resolve(process.cwd(), pkg)
            const pkgSource = path.relative(pkgFolder, options.main)

            const pkgExport = {
                name: `${root}/${pkg}`,
                main: pkgSource,
                private: true
            }

            fse.ensureDirSync(pkgFolder)
            fse.writeJsonSync(path.join(pkgFolder, './package.json'), pkgExport)
    })
}

export default () => {
    yargs
        .command('subexports', 'exporting optional sub packages', () => {}, commandHandler)
}