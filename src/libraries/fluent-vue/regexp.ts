// $t('message-id') in templates; $t via useFluent() in Composition API
const tMethodRegExp: string = `(?<=(?<![A-Za-z0-9])\\$t\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

// v-t="'message-id'" or v-t="message-id" directive
const vTDirectiveRegExp: string = `(?<=\\bv-t=["']{1,2})([a-zA-Z0-9_\\-.]*)(?=["']{1,2})`;

export const fluentVueRegEx: string[] = [
    tMethodRegExp,
    vTDirectiveRegExp,
];