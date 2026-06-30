// t('KEY') from useTranslation() hook or withTranslation() HOC
// Also matches namespace-prefixed: t('ns:KEY')
const tFunctionRegExp: string = `(?<=(?<![A-Za-z0-9])t\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

// <Trans i18nKey="KEY"> component
const transComponentRegExp: string = `(?<=<Trans[^>]*?\\bi18nKey=(?:\\{\\s*)?['"\`])([^'"\`]+)(?=['"\`])`;

export const nextI18nextRegEx: string[] = [
    tFunctionRegExp,
    transComponentRegExp,
];