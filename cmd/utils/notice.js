
const dryRun = (logger) => {
    logger.newline().heading('    >>> DRY MODE <<<    ').heading('no changes will be made!').newline();
}

export const notice = {
    dryRun,
}
