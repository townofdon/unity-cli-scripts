import { execFileSync } from 'child_process';

import { logger } from './utils/logger.js';

export const webglCommand = {
    command: 'webgl',
    desc: 'test a Unity build locally using Docker',
    builder: (yargs) => {
        return yargs
    },
    handler: async function (options) {
        try {
            process.chdir('./shell');
            execFileSync('./webgl.sh', { stdio: 'inherit' });
        } catch (error) {
            logger.errorAndExit(error.message)
        }
    }
}
