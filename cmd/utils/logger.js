#!/usr/bin/env node

import chalk from 'chalk';

function heading(msg) {
    console.log(chalk.bgYellow(chalk.black(' ' + msg + ' ')));
    return logger;
}

function newline() {
    console.log("");
    return logger;
}

function info(msg) {
    console.log(msg);
    return logger;
}

function dim(msg) {
    console.log(chalk.dim(msg));
    return logger;
}

function warn(msg) {
    console.log(chalk.yellow(msg));
    return logger;
}

function success(msg) {
    console.log(chalk.green(`✓ ${msg}`));
    return logger;
}

function error(msg) {
    console.log(chalk.red(msg));
    return logger;
}

function errorAndExit(msg) {
    error(msg);
    process.exit(1);
}

export const logger = {
    info,
    dim,
    warn,
    success,
    error,
    errorAndExit,
    heading,
    newline,
};
