import yaml from 'yaml'
import chalk from 'chalk';
import semver from 'semver'
import path from 'path';
import fs from 'fs-extra';

import { logger } from './utils/logger.js';
import { prompt } from './utils/prompt.js';
import { validateVersion } from './utils/validateVersion.js'
import { toolPrintDiff } from './utils/diff.js';
import { notice } from './utils/notice.js';

export const versionCommand = {
  command: 'version',
  desc: 'bump the Unity version number',
  builder: (yargs) => {
    return yargs
      .option("set", { describe: "Set version manually", type: "string" })
      .option("major", { describe: "Major version bump", type: "boolean" })
      .option("minor", { describe: "Minor version bump", type: "boolean" })
      .option("patch", { describe: "Patch version bump", type: "boolean" })
      .option("dry", { describe: "perform a dry run", type: "boolean" })
  },
  handler: async function (options) {
    const [printDiff, cleanup] = toolPrintDiff(logger);
    try {
      if (!options.set && !options.major && !options.minor && !options.patch) {
        throw new Error('Argument --<major|minor|patch> required');
      }
      if (options.set && (options.major || options.minor || options.patch)) {
        throw new Error('Argument --set incompatible with --<major|minor|patch>');
      }

      if (!process.env.UNITY_PROJECT_ROOT) throw new Error("UNITY_PROJECT_ROOT is missing from .env file");

      if (options.dry) {
        notice.dryRun(logger);
      } else {
        logger.newline();
      }

      const projectSettingsPath = path.resolve(process.env.UNITY_PROJECT_ROOT, 'ProjectSettings/ProjectSettings.asset');
      const settingsYaml = fs.readFileSync(projectSettingsPath, 'utf8');
      const settings = yaml.parse(settingsYaml, { logLevel: 'silent', schema: 'failsafe' });

      // semver fails to recognize "1" and "1.0" as valid version numbers
      if (settings.PlayerSettings.bundleVersion == '1' || settings.PlayerSettings.bundleVersion == '1.0') {
        settings.PlayerSettings.bundleVersion = '1.0.0';
      }

      logger.info('Bumping Unity Project Version...');
      logger.info(`Company Name:${chalk.yellowBright(settings.PlayerSettings.companyName)}`);
      logger.info(`Product Name:${chalk.yellowBright(settings.PlayerSettings.productName)}`);
      logger.info(`Current version: ${chalk.redBright(settings.PlayerSettings.bundleVersion)}`);

      if (options.set) {
        validateVersion(options.set)
        if (options.set == settings.PlayerSettings.bundleVersion) {
          throw new Error("No change in version")
        }
      } else {
        validateVersion(settings.PlayerSettings.bundleVersion)
      }

      if (options.set) {
        settings.PlayerSettings.bundleVersion = options.set
      } else if (options.major) {
        settings.PlayerSettings.bundleVersion = semver.inc(settings.PlayerSettings.bundleVersion, 'major');
      } else if (options.minor) {
        settings.PlayerSettings.bundleVersion = semver.inc(settings.PlayerSettings.bundleVersion, 'minor');
      } else if (options.patch) {
        settings.PlayerSettings.bundleVersion = semver.inc(settings.PlayerSettings.bundleVersion, 'patch');
      } else {
        throw new Error('Argument --<major|minor|patch> required');
      }

      logger.info(`New version: ${chalk.cyanBright(settings.PlayerSettings.bundleVersion)}`);

      // this does not work, as UnityYAML is its own proprietary format, whowuddaguessed??
      // const newSettingsYaml = yaml.stringify(settings);

      // so, just use a regex to replace the desired row
      const newSettingsYaml = settingsYaml.replace(/bundleVersion: .*\n^/m, `bundleVersion: ${settings.PlayerSettings.bundleVersion}\n`);

      if (options.dry) {
        logger.warn("\ndry run... no changes were made");

        await printDiff(settingsYaml, newSettingsYaml, 'ProjectSettings.asset');
      } else {
        await prompt.confirm();
        fs.writeFileSync(projectSettingsPath, newSettingsYaml);
        logger.success("Successfully updated ProjectSettings.asset");
      }
      cleanup();
    } catch (error) {
      logger.errorAndExit(error.message)
      cleanup();
    }
  }
}
