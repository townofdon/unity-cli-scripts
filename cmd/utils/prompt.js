
import chalk from 'chalk';
import inquirer from 'inquirer';

const inquire = inquirer.createPromptModule();

const confirm = async (message = 'Proceed?') => {
    const result = await inquire({ type: 'confirm', name: 'confirmAction', message, default: true })
    if (!result.confirmAction) throw new Error("user cancelled")
}

/**
 * 
 * @param {string} message
 * @param {{ defaultValue?: string, required?: boolean }} options
 * @returns {Promise<string>} result
 */
const input = async (message, { defaultValue = undefined, required = false } = {}) => {
    if (!message) throw new Error("message is a required param");
    const result = await inquire({ type: 'input', name: 'input', message, default: defaultValue })
    if (result.input == null || result.input == undefined || result.input == "") {
        if (required) {
            console.log(chalk.red("required"));
            return input(message, defaultValue, required);
        }
    }
    return result.input
}

/**
 * 
 * @param {string} message 
 * @param {{ name: string, value: string }[]} choices
 * @param {{ defaultValue?: string }} options
 * @returns {Promise<any>} result
 */
const select = async (message, choices = [], { defaultValue = undefined } = {}) => {
    if (!message) throw new Error("message is a required param");
    const result = await inquire({ type: 'list', name: 'selection', message, choices, default: defaultValue })
    return result.selection
}

export const prompt = {
    input,
    confirm,
    select,
}
