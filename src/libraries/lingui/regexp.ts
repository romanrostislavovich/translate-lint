const transComponentRegExp: string = `(?<=<Trans[^>]*\\bid=(?:\\{?['"]))([^'"]+)(?=['"]\\}?)`;
const macroRegExp: string = `(?<=(?<![A-Za-z0-9])(?:t|msg)\\s*\\(\\s*\\{\\s*id\\s*:\\s*['"])([^'"]+)(?=['"])`;

export const linguiRegEx: string[] = [
    transComponentRegExp,
    macroRegExp
];