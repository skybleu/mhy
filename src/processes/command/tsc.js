import yargs from 'yargs'

import { loadProcess, buildMhyArgv } from '@/processes'
import FileTypes from '@/utils/fileTypes'

const commandHandler = argv => {
    const Tsc = loadProcess('tsc')()
    const fn = require('@/configs/typescript/write')
    // Write ts config if not exists
    ;(fn.default || fn)(process.cwd(), FileTypes.JSON, false)
    new Tsc(buildMhyArgv(argv))
}

export default () => {
    yargs.command(
        ['tsc', 'ts'],
        'run TypeScript Compiler for type checking and generating d.ts files',
        () => {},
        commandHandler
    )
}
