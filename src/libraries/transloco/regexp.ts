// 'KEY' | transloco  (pipe in template, optional :{ params } before pipe)
const pipeRegExp: string = `(?<=['"])([a-zA-Z0-9_.\\-]+)(?=['"]\\s*(?::[^|]*)?\\|\\s*transloco\\b)`;

// translocoService.translate('KEY') / translocoService.selectTranslate('KEY')
// Covers aliased injections too: myService.translate('KEY')
const serviceRegExp: string = `(?<=\\.(?:translate|selectTranslate)\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

// t('KEY') inside *transloco="let t" structural directive blocks
const tFunctionRegExp: string = `(?<=(?<![A-Za-z0-9])t\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

export const translocoRegEx: string[] = [
    pipeRegExp,
    serviceRegExp,
    tFunctionRegExp,
];