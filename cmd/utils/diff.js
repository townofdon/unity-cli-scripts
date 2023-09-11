import { exec } from 'child_process';
import filesystem from 'fs-jetpack';
import tmp from 'tmp';
import chalk from 'chalk';

const cmd = (command = '') => {
  return new Promise((resolve, reject) => {
    exec(command, undefined, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout
        error.stderr = stderr
        return reject(error)
      }
      resolve((stdout || ''))
    })
  })
}

export const toolPrintDiff = (logger) => {
  const { path } = filesystem;
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  const tmpDirPath = tmpDir.name;

  const cleanup = () => {
    tmpDir.removeCallback();
    filesystem.remove(tmpDirPath);
  };

  /**
   * Print out a diff of original vs. new
   * @param {string} originalContent 
   * @param {string} newContent 
   * @param {string} fileName - NOT the full path, just the file name
   */
  const printDiff = async (originalContent, newContent, fileName = undefined) => {
    const tempCwd = filesystem.cwd();
    process.chdir(tmpDirPath);
    const tmpFileName = fileName || 'TEMP_CONTENT.txt';
    const tmpFilepath = path(tmpDirPath, tmpFileName);
    filesystem.dir(tmpDirPath);
    filesystem.remove(path(tmpDirPath, '.git'));
    filesystem.remove(path(tmpDirPath, tmpFilepath));
    await cmd('git init');
    filesystem.file(tmpFilepath);
    filesystem.write(tmpFilepath, originalContent);
    await cmd('git add . && git commit -m "temp commit"');
    filesystem.write(tmpFilepath, newContent);
    const diff = (await cmd('git diff --no-color --ignore-space-at-eol --no-ext-diff')) || '';
    logger.divider();
    // prettier-ignore
    logger.info(chalk.gray(diff
      .replace(/^(\+.*)$/gm, `${chalk.green('$1')}`)
      .replace(/^(\-.*)$/gm, `${chalk.red('$1')}`)));
    process.chdir(tempCwd);
  };
  return [printDiff, cleanup];
};
