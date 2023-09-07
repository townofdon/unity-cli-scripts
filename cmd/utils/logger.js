#!/usr/bin/env node

import chalk from 'chalk';

function info(msg) {
    console.log(msg);
}

function warn(msg) {
    console.log(chalk.yellow(msg));
}

function success(msg) {
    console.log(chalk.green(`✓ ${msg}`));
}

function error(msg) {
    console.log(chalk.red(msg));
}

function errorAndExit(msg) {
    error(msg);
    process.exit(1);
}

export const logger = {
    info,
    warn,
    success,
    error,
    errorAndExit,
};
