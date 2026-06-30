// $t('KEY'), $tc('KEY', n), $te('KEY') in Vue templates; t('KEY') in Composition API (useI18n)
// Also covers: i18n.t('KEY') since lookbehind allows '.' before 't'
const tMethodRegExp: string = `(?<=(?<![A-Za-z0-9])\\$?t[ce]?\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

// v-t="'KEY'" or v-t="KEY" directive
const vTDirectiveRegExp: string = `(?<=\\bv-t=["']{1,2})([a-zA-Z0-9_.\\-]+)(?=["']{1,2})`;

// <i18n-t keypath="KEY"> (vue-i18n v9 component, used in Nuxt 3)
const i18nComponentRegExp: string = `(?<=<(?:i18n-t|i18n)\\b[^>]*\\b(?:keypath|path)=["'])([^"']+)(?=["'])`;

export const nuxtI18nRegEx: string[] = [
    tMethodRegExp,
    vTDirectiveRegExp,
    i18nComponentRegExp,
];