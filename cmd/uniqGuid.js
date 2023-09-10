import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuid } from 'uuid';

import { logger } from './utils/logger.js';
import { confirm } from './utils/confirm.js';

export const uniqGuidCommand = {
  command: 'uniq-guid',
  desc: 'check for duplicate guids and make them unique',
  builder: (yargs) => {
    return yargs
      .option("monobehaviour", { describe: "name of the MonoBehaviour (file name must match the class)", type: "string", default: "MonoSaveable" })
      .option("uuidfield", { describe: "name of the uuid field to make unique", type: "string", default: '_uuid' })
      .option("assetsdir", { describe: "directory where to search for project assets", type: "string", default: 'Assets' })
      .option("dry", { describe: "perform a dry run", type: "boolean" })
      .option("verbose", { describe: "print out more stuff when running script", type: "boolean" })
  },
  handler: async function (options) {
    try {
      if (!process.env.UNITY_PROJECT_ROOT) throw new Error("UNITY_PROJECT_ROOT is missing from .env file");

      const assetsPath = options.assetsdir;
      const uuidField = options.uuidfield;
      const monobehaviourName = options.monobehaviour;

      const projectRoot = path.resolve(process.env.UNITY_PROJECT_ROOT);
      const assetsDir = path.resolve(projectRoot, assetsPath);
      const monobehaviourGuid = getMonobehaviourGuid(monobehaviourName, projectRoot);

      if (monobehaviourGuid === null) {
        throw new Error(`Could not find ${`${monobehaviourName}.cs.meta`} in project ${projectRoot}`);
      }

      logger.info(`Found MonoBehaviour "${chalk.yellow(monobehaviourName)}" with guid: ${chalk.yellow(monobehaviourGuid)}`)
      logger.info('Searching for relevant files in project...');

      const files = getFilesFlatList(assetsDir);

      if (options.verbose) {
        logger.newline().heading("all relevant files:");
        files.forEach(file => logger.warn(file));
        logger.newline();
      }

      logger.info('Finding duplicate uuids...');

      const { duplicates, uuids } = getDuplicates(files, uuidField, monobehaviourGuid);

      if (options.verbose) {
        logger.newline().heading("all uuids:");
        uuids.forEach(uuid => logger.warn(uuid));
        logger.newline().heading("duplicates:");
        duplicates.forEach(dupe => console.log(dupe));
        console.log("");
        logger.newline();
      }

      if (duplicates.length > 0) {
        if (options.dry) {
          logger.newline().warn(`Found ${chalk.redBright(duplicates.length)} duplicates.`)
        } else {
          logger.newline().info(`Found ${chalk.redBright(duplicates.length)} duplicates. Generate new UUIDs and replace duplicates?`)
          await confirm();
          replaceDuplicateUuids(duplicates, uuidField, options);
          logger.newline().success('All done!');
        }
      } else {
        logger.success('No duplicates found!');
      }
    } catch (error) {
      logger.error(error.stack);
      logger.errorAndExit(error.message)
    }
  }
}

const hasExtension = (file, extension = "") => {
  if (!file) return false;
  if (!extension) return false;
  const parts = file.split('.');
  if (parts[parts.length - 1] === extension) return true;
  return false;
}

const getFileWithoutAbsPath = (file) => {
  if (!file) return String(file);
  const parts = file.split('/');
  if (!parts.length) return String(file);
  return parts[parts.length - 1];
}

const getFilesFlatList = (rootDirectory) => {
  const files = [];
  const worker = (currentDir) => {
    fs.readdirSync(currentDir).forEach(file => {
      const absPath = path.join(currentDir, file);
      if (fs.statSync(absPath).isDirectory()) return worker(absPath);
      if (hasExtension(file, 'prefab') || hasExtension(file, 'unity')) files.push(absPath);
    });
  };
  worker(rootDirectory);
  return files;
}

const getMonobehaviourGuid = (monobehaviourName = "", rootDirectory) => {
  if (!monobehaviourName) return null;

  const state = {
    filePath: '',
    guid: ''
  }

  const find = (currentDir) => {
    const files = fs.readdirSync(currentDir)
    for (let i = 0; i < files.length; i++) {
      const absPath = path.join(currentDir, files[i]);
      if (files[i] === `${monobehaviourName}.cs.meta`) {
        state.filePath = absPath;
        return true;
      }
      if (fs.statSync(absPath).isDirectory()) {
        const found = find(absPath);
        if (found) return true;
      }
    }
    return false;
  };

  const found = find(rootDirectory);
  if (found) {
    const contents = fs.readFileSync(state.filePath);
    const regex = /^guid: (.*)$/m;
    const matches = regex.exec(contents);
    if (matches != null && matches.length > 0) {
      // first match is always the full match result; subsequent are the regex capture groups
      state.guid = matches[1]
      return state.guid;
    }
  }
  return null;
}

/**
 * Get duplicates
 * @param {string[]} files 
 * @param {string} uuidField
 * @param {string} monobehaviourGuid
 * @returns {{ duplicates: { uuid: string, file: string, lineNumber: number }[], uuids: string[] }} results
 */
const getDuplicates = (files, uuidField, monobehaviourGuid) => {
  const uuids = []
  const duplicates = []
  const uuidMap = {}
  const uuidRegex = new RegExp(`^\\s+${uuidField}:\\s+(.*)$`, 'm');

  files.forEach(file => {
    const contentsRaw = fs.readFileSync(file);
    if (!contentsRaw) return;

    const contents = contentsRaw.toString('utf8');
    if (!contents.includes(monobehaviourGuid)) return;
    if (!contents.includes(uuidField)) return;

    const lines = contents.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(uuidRegex);
      if (!matches || !matches.length) continue;

      const uuid = matches[1];

      // iterate backwards, looking for two things: "guid: <monobehaviourGuid>" match, as well as "MonoBehaviour" indicating that this obj is in fact a MonoBehaviour
      let isMonoBehaviour = false;
      let hasMonoGuid = false;
      let j = i;
      while (!hasMonoGuid && !isMonoBehaviour && j > 0) {
        if (lines[j].includes('MonoBehaviour:')) { isMonoBehaviour = true; break; }
        if (lines[j].includes(`guid: ${monobehaviourGuid}`)) { hasMonoGuid = true; break; }
        if (lines[j].includes('---')) { break; }
        j--;
      }

      if (isMonoBehaviour && !hasMonoGuid) {
        // iterate forwards and see if we can find the MonoGuid match
        j = i
        while (!hasMonoGuid && j < lines.length) {
          if (lines[j].includes(`guid: ${monobehaviourGuid}`)) { hasMonoGuid = true; break; }
          if (lines[j].includes('---')) { break; }
          j++;
        }
      }

      if (!hasMonoGuid) continue;

      if (uuidMap[uuid]) {
        duplicates.push({
          uuid,
          file,
          lineNumber: i,
        });
      } else {
        uuidMap[uuid] = true;
      }

      uuids.push(uuid);
    }
  })

  return { duplicates, uuids }
}

/**
 * Replace duplicates
 * @param {{ uuid: string, file: string, lineNumber: number }[]} duplicates
 * @param {string} uuidField
 */
const replaceDuplicateUuids = (duplicates, uuidField, options) => {
  logger.newline();
  duplicates.forEach(dupe => {
    const contentsRaw = fs.readFileSync(dupe.file);
    if (!contentsRaw) return;
    const contents = contentsRaw.toString('utf8');
    const lines = contents.split('\n');
    if (lines.length <= dupe.lineNumber) {
      if (options.verbose) logger.error(`file ${dupe.file} had less lines (${lines.length}) than dupe line number (${dupe.lineNumber})`);
      return;
    }
    if (!lines[dupe.lineNumber].includes(dupe.uuid)) {
      if (options.verbose) logger.error(`file line ${dupe.lineNumber} did not include dupe uuid (${dupe.uuid}) - line: ${lines[dupe.lineNumber]}`);
      return;
    }
    const newUuid = uuid();
    const newLine = `  ${uuidField}: ${newUuid}`;
    const newContent = lines.map((line, index) => index === dupe.lineNumber ? newLine : line).join('\n');

    fs.writeFileSync(dupe.file, newContent);

    logger.info(`${chalk.cyan(getFileWithoutAbsPath(dupe.file))}: generated new uuid at line ${chalk.green(dupe.lineNumber + 1)} => ${chalk.green(newUuid)}`)
  });
}
