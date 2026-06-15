const tFunctionRegExp: string = `(?<=(?<![A-Za-z0-9])t(?:\\.rich|\\.markup|\\.raw|\\.html)?\\(['"])([^'"]+)(?=['"])`;

export const nextIntlRegEx: string[] = [
    tFunctionRegExp
];