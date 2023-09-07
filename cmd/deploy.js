import yaml from 'yaml'
import path from 'path';
import fs from 'fs-extra';
import { execFileSync } from 'child_process';

import { logger } from './utils/logger.js';
import { validateVersion } from './utils/validateVersion.js'

export const deployCommand = {
    command: 'deploy',
    desc: 'deploy a Unity build to Itch.io',
    builder: (yargs) => {
        return yargs
    },
    handler: async function (options) {
        try {
            if (!process.env.UNITY_PROJECT_ROOT) throw new Error("UNITY_PROJECT_ROOT is missing from .env file");

            const projectSettingsPath = path.resolve(process.env.UNITY_PROJECT_ROOT, 'ProjectSettings/ProjectSettings.asset');
            const settingsYaml = fs.readFileSync(projectSettingsPath, 'utf8');
            const settings = yaml.parse(settingsYaml, { logLevel: 'silent' });
            const currentVersion = settings.PlayerSettings.bundleVersion;

            validateVersion(currentVersion);

            process.chdir('./shell');
            execFileSync('./deploy.sh', ['--version', currentVersion], { stdio: 'inherit' });
        } catch (error) {
            logger.errorAndExit(error.message)
        }
    }
}
