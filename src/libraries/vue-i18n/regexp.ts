// $t('key'), $tc('key', n), $te('key') in templates; t('key') in Composition API (useI18n)
const tMethodRegExp: string = `(?<=(?<![A-Za-z0-9])\\$?t[ce]?\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

// v-t="'KEY'" or v-t="KEY" directive
const vTDirectiveRegExp: string = `(?<=\\bv-t=["']{1,2})([a-zA-Z0-9_\\-.]+)(?=["']{1,2})`;

// <i18n-t keypath="KEY"> (v9+) and <i18n path="KEY"> (v8 legacy)
const i18nComponentRegExp: string = `(?<=<(?:i18n-t|i18n)\\b[^>]*\\b(?:keypath|path)=["'])([^"']+)(?=["'])`;

export const vueI18nRegEx: string[] = [
    tMethodRegExp,
    vTDirectiveRegExp,
    i18nComponentRegExp,
];