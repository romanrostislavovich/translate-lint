// $t('key') in templates; t('key') in Composition API (useTranslation)
const tMethodRegExp: string = `(?<=(?<![A-Za-z0-9])\\$?t\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

// <i18next path="KEY"> component
const i18nextComponentRegExp: string = `(?<=<i18next\\b[^>]*\\bpath=["'])([^"']+)(?=["'])`;

export const i18nextVueRegEx: string[] = [
    tMethodRegExp,
    i18nextComponentRegExp,
];