const tFunctionRegExp: string = `(?<=(?<![A-Za-z0-9])t\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;
const transComponentRegExp: string = `(?<=<Trans[^>]*?\\bi18nKey=(?:\\{\\s*)?['"\`])([^'"\`]+)(?=['"\`])`;

export const reactI18NextRegEx: string[] = [
    tFunctionRegExp,
    transComponentRegExp
];