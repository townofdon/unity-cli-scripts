import { execFileSync } from 'child_process';

import { logger } from './utils/logger.js';

export const testCommand = {
    command: 'test',
    desc: 'test a Unity build locally using Docker',
    builder: (yargs) => {
        return yargs
    },
    handler: async function (options) {
        try {
            process.chdir('./shell');
            execFileSync('./test.sh', { stdio: 'inherit' });
        } catch (error) {
            logger.errorAndExit(error.message)
        }
    }
}
