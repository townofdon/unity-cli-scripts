#!/usr/bin/env node

import chalk from 'chalk';

function heading(msg) {
    console.log(chalk.bgYellow(chalk.black(' ' + msg + ' ')));
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

function errorAndExit(err) {
    if (err instanceof Error) {
        error(err.stack);
        error(err.message);
    } else {
        error(err);
    }

    process.exit(1);
}

function newline() {
    console.log("");
    return logger;
}

function divider() {
    for (let i = 0; i < 80; i++) {
        process.stdout.write(chalk.dim('-'));
    }
    return newline();
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
    divider,
};
