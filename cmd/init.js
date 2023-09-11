import yaml from 'yaml'
import path from 'path';
import fs from 'fs-extra';

import { logger } from './utils/logger.js';
import { prompt } from './utils/prompt.js';
import { notice } from './utils/notice.js';
import { toolPrintDiff } from './utils/diff.js';
import chalk from 'chalk';

const Platform = {
  WindowsMacLinux: 0,
  WebGL: 2,
};

const WebGLCompressionFormat = {
  Brotli: 0,
  Gzip: 1,
  None: 2,
};

export const initCommand = {
  command: 'init',
  desc: 'initialize unity settings',
  builder: (yargs) => {
    return yargs
      .option("dry", { describe: "perform a dry run", type: "boolean" })
  },
  handler: async function (options) {
    const [printDiff, cleanup] = toolPrintDiff(logger);
    try {
      if (!process.env.UNITY_PROJECT_ROOT) throw new Error("UNITY_PROJECT_ROOT is missing from .env file");

      logger.info(`
      █░█ █▄░█ █ ▀█▀ █▄█   █ █▄░█ █ ▀█▀
      █▄█ █░▀█ █ ░█░ ░█░   █ █░▀█ █ ░█░`).newline();
      logger.info(`Current project: ${chalk.cyan(process.env.UNITY_PROJECT_ROOT)}`);

      if (options.dry) {
        notice.dryRun(logger);
      } else {
        logger.newline();
      }

      const projectSettingsPath = path.resolve(process.env.UNITY_PROJECT_ROOT, 'ProjectSettings/ProjectSettings.asset');
      const settingsYaml = fs.readFileSync(projectSettingsPath, 'utf8');
      const settings = yaml.parse(settingsYaml, { logLevel: 'silent' });

      settings.PlayerSettings.companyName = await prompt.input('Company Name?', { defaultValue: settings.PlayerSettings.companyName, required: true });
      settings.PlayerSettings.productName = await prompt.input('Product Name?', { defaultValue: settings.PlayerSettings.productName, required: true });
      settings.PlayerSettings.bundleVersion = await prompt.input('Version?', { defaultValue: '0.0.1', required: true });

      settings.PlayerSettings.selectedPlatform = await prompt.select('Platform', [
        { name: 'WebGL', value: Platform.WebGL },
        { name: 'Windows/Mac/Linux', value: Platform.WindowsMacLinux },
      ], { defaultValue: Platform.WebGL })

      if (settings.PlayerSettings.selectedPlatform == Platform.WebGL) {
        settings.PlayerSettings.webGLCompressionFormat = await prompt.select('WebGL Compression', [
          { name: 'Brotli', value: WebGLCompressionFormat.Brotli },
          { name: 'Gzip', value: WebGLCompressionFormat.Gzip },
          { name: 'None', value: WebGLCompressionFormat.None },
        ], { defaultValue: WebGLCompressionFormat.None })
      }

      // this does not work, as UnityYAML is its own proprietary format, whowuddaguessed??
      // const newSettingsYaml = yaml.stringify(settings);

      // so, just use a regex to replace the desired row
      let newSettingsYaml = settingsYaml;

      newSettingsYaml = replaceSetting('bundleVersion', settings.PlayerSettings.bundleVersion, newSettingsYaml);
      newSettingsYaml = replaceSetting('companyName', settings.PlayerSettings.companyName, newSettingsYaml);
      newSettingsYaml = replaceSetting('productName', settings.PlayerSettings.productName, newSettingsYaml);
      newSettingsYaml = replaceSetting('productName', settings.PlayerSettings.productName, newSettingsYaml);
      newSettingsYaml = replaceSetting('webGLCompressionFormat', settings.PlayerSettings.webGLCompressionFormat, newSettingsYaml);

      if (options.dry) {
        logger.warn("\ndry run... no changes were made");
        await printDiff(settingsYaml, newSettingsYaml, 'ProjectSettings.asset');
      } else {
        await prompt.confirm('Commit changes to ProjectSettings.asset?');
        fs.writeFileSync(projectSettingsPath, newSettingsYaml);
        logger.success("Successfully updated ProjectSettings.asset");
      }
      cleanup();
    } catch (error) {
      cleanup();
      logger.errorAndExit(error)
    }
  }
}

/**
 * Return new settingsYaml with modified key: value
 * @param {string} key
 * @param {string} value
 * @param {string} settingsYaml
 * @returns {string}
 */
const replaceSetting = (key, value, settingsYaml) => {
  const regex = new RegExp(`${key}: .*\\n^`, 'm');
  if (!regex.test(settingsYaml)) return settingsYaml;
  return settingsYaml.replace(regex, `${key}: ${value}\n`)
}
