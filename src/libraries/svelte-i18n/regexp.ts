// $_(KEY), $format('KEY'), $t('KEY') in .svelte files (Svelte auto-subscribe syntax)
// _ and format are the same store; t is a built-in re-export alias
const dollarStoreRegExp: string = `(?<=(?<![A-Za-z0-9])\\$(?:_|format|t)\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

// get(_)('KEY'), get(format)('KEY'), get(t)('KEY') in .ts/.js / SvelteKit load functions
const getStoreRegExp: string = `(?<=\\bget\\s*\\(\\s*(?:_|format|t)\\s*\\)\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

// $json('KEY') — retrieve a subtree by key (less common but valid key reference)
const jsonStoreRegExp: string = `(?<=(?<![A-Za-z0-9])\\$json\\s*\\(\\s*['"\`])([^'"\`]+)(?=['"\`])`;

export const svelteI18nRegEx: string[] = [
    dollarStoreRegExp,
    getStoreRegExp,
    jsonStoreRegExp,
];