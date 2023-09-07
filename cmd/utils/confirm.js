
import inquirer from 'inquirer';

const prompt = inquirer.createPromptModule();

export const confirm = async (message = 'Proceed?') => {
    const result = await prompt({ type: 'confirm', name: 'confirmAction', message: 'Proceed?', default: true })
    if (!result.confirmAction) throw new Error("user cancelled")
}
