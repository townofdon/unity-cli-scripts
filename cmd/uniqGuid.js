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
      .option("uuidfield", { describe: "name of the uuid field to make unique", type: "string", default: '_uuid' })
      .option("searchdir", { describe: "directory where to search for project assets", type: "string", default: 'Assets' })
      .option("dry", { describe: "perform a dry run", type: "boolean" })
      .option("verbose", { describe: "print out more stuff when running script", type: "boolean" })
  },
  handler: async function (options) {
    try {
      if (!process.env.UNITY_PROJECT_ROOT) throw new Error("UNITY_PROJECT_ROOT is missing from .env file");
      if (options.uuidfield == 'guid') throw new Error("--uuidfield cannot be \"guid\" as this will clash with internal unity guids");

      if (options.dry) {
        logger.newline().heading('    >>> DRY MODE <<<    ').heading('no changes will be made!').newline();
      } else {
        logger.newline();
      }

      const searchPath = options.searchdir;
      const uuidField = options.uuidfield;

      const projectRoot = path.resolve(process.env.UNITY_PROJECT_ROOT);
      const searchDir = path.resolve(projectRoot, searchPath);

      logger.info(`Searching for relevant files in project at ${chalk.yellow(searchDir)} ...`);

      const files = getFilesFlatList(searchDir);

      if (options.verbose) {
        logger.newline().heading("all files to be searched:");
        files.forEach(file => logger.warn(file));
        logger.newline();
      }

      logger.info('Finding duplicate uuids...');

      const { duplicates, uuids } = getDuplicates(files, uuidField);

      if (uuids.length == 0) throw new Error("No uuids found - ensure \"--uuidfield\" param is correct")

      logger.info(`Found ${chalk.cyan(uuids.length)} uuids across project`);

      if (options.verbose) {
        logger.newline().heading("all uuids found:");
        uuids.forEach(uuid => logger.warn(uuid));
        logger.newline();
        logger.heading("duplicates:");
        duplicates.forEach(dupe => console.log({
          ...dupe,
          lineNumber: dupe.lineNumber + 1,
          replacement: dupe.replacement.replace("%s", "<new_uuid>"),
        }));
        logger.newline();
      }

      if (duplicates.length > 0) {
        logger.newline().warn(`Found ${chalk.redBright(duplicates.length)} duplicates.`)
        if (!options.dry) {
          logger.newline().info("Generate new UUIDs for duplicates?");
          await confirm();
        }
        replaceDuplicateUuids(duplicates, options);
        if (!options.dry) {
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

/**
 * Get duplicates
 * @param {string[]} files 
 * @param {string} uuidField
 * @returns {{ duplicates: { uuid: string, file: string, lineNumber: number, replacement: string }[], uuids: string[] }} results
 */
const getDuplicates = (files, uuidField) => {
  const uuids = []
  const duplicates = []
  const uuidMap = {}

  // search for a line in the .meta file like "_uuid: <value>"
  const regexUUID = new RegExp(`^\\s+${uuidField}:\\s+(.*)$`, 'm');

  // search for a line in the .meta file like "propertyPath: _uuid" - additional work will need to be done to find the actual uuid line
  const regexPropertyPath = new RegExp(`^\\s+propertyPath:\\s+${uuidField}$`, 'm');

  // search for a line in the .meta file like "value: <value>"
  const regexValueField = /^\s+value: (.*)$/m;
  const regexFirstNonWhitespace = /[-_a-zA-Z0-9]/;

  const checkMatchFound = ({ matches, file = "", lineNumber = -1, indentation = 0, replacement = '' } = {}) => {
    if (!matches || matches.length !== 2) return false;
    if (!file) return false;
    if (lineNumber === -1) return false;

    const uuid = matches[1];
    if (uuidMap[uuid]) {
      duplicates.push({
        uuid,
        file,
        lineNumber,
        indentation,
        replacement,
      });
    } else {
      uuidMap[uuid] = true;
    }

    uuids.push(uuid);
    return true;
  }

  files.forEach(file => {
    const contentsRaw = fs.readFileSync(file);
    if (!contentsRaw)
      return;

    const contents = contentsRaw.toString('utf8');

    if (!contents.includes(uuidField))
      return;

    const lines = contents.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // get num spaces to first character
      const indentation = line.search(regexFirstNonWhitespace);
      if (indentation < 0)
        continue;

      // look for "_uuid: <value>" field
      let matches = line.match(regexUUID);
      if (checkMatchFound({ matches, file, lineNumber: i, indentation, replacement: `${uuidField}: %s` }))
        continue;

      // break if at end
      if (i == lines.length - 1)
        break;

      // look for "propertyPath: _uuid" field
      matches = line.match(regexPropertyPath);
      if (!matches || !matches.length)
        continue;

      let indentationNext = -1;

      // walk forward, looking for the "value: <value>" field
      // use a simple indentation comparison to ensure that we are still evaluating the same obj
      let j = i;
      do {
        j++;
        indentationNext = lines[j].search(regexFirstNonWhitespace);
        if (indentation != indentationNext)
          continue;
        matches = lines[j].match(regexValueField);
        if (checkMatchFound({ matches, file, lineNumber: j, indentation, replacement: 'value: %s' }))
          break;
      } while (indentationNext == indentation && j < lines.length - 1);

      if (i == 0)
        continue;

      // walk backwards, looking for the "value: <value>" field
      j = i;
      do {
        j--;
        indentationNext = lines[j].search(regexFirstNonWhitespace);
        if (indentation != indentationNext)
          continue;
        matches = lines[j].match(regexValueField);
        if (checkMatchFound({ matches, file, lineNumber: j, indentation, replacement: 'value: %s' }))
          break;
      } while (indentationNext == indentation && j > 0);
    }
  })

  return { duplicates, uuids }
}

/**
 * Replace duplicates
 * @param {{ uuid: string, file: string, lineNumber: number, indentation: number, replacement: string }[]} duplicates
 */
const replaceDuplicateUuids = (duplicates, options) => {
  logger.newline();
  const files = getUniqFilesFromDuplicates(duplicates);

  files.forEach(file => {
    const contentsRaw = fs.readFileSync(file);
    if (!contentsRaw) return;

    const contents = contentsRaw.toString('utf8');
    const lines = contents.split('\n');
    const filteredDuplicates = duplicates.filter(dupe => dupe.file === file);

    const newLines = lines.map((line, index) => {
      const dupe = filteredDuplicates.find(dupe => dupe.lineNumber === index);
      if (!dupe) return line;

      const newUuid = uuid();
      const newLine = ''.padStart(dupe.indentation, ' ') + dupe.replacement.replace('%s', newUuid);

      if (options.dry) {
        const lineStart = Math.max(index - 5, 0);
        const lineEnd = Math.min(index + 5, lines.length - 1);
        let i = lineStart;
        logger.warn(`${file} L${lineStart}..${lineEnd}`);
        while (i <= lineEnd) {
          if (i === dupe.lineNumber) {
            logger.info(chalk.red(`-${i + 1} ${lines[i]}`));
            logger.info(chalk.green(`+${i + 1} ${newLine}`));
          } else {
            logger.dim(` ${i + 1} ${lines[i]}`);
          }
          i++;
        }
        logger.newline();
      } else {
        logger.info(`${chalk.cyan(getFileWithoutAbsPath(dupe.file))}: generated new uuid at line ${chalk.green(dupe.lineNumber + 1)} => ${chalk.green(newUuid)}`)
      }

      return newLine;
    });

    const newContent = newLines.join('\n');

    if (!options.dry) {
      fs.writeFileSync(file, newContent);
    }
  });
}

/**
 * Get unique files from duplicates list
 * @param {{ uuid: string, file: string, lineNumber: number }[]} duplicates
 * @returns {string[]} files
 */
const getUniqFilesFromDuplicates = (duplicates) => {
  if (!duplicates || !duplicates.length) return [];

  const fileMap = {};

  duplicates.forEach(dupe => {
    fileMap[dupe.file] = dupe.file;
  });

  return Object.keys(fileMap);
}
