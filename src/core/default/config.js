
const config = {
    rule: {
        keysOnViews: {
            type: "error",
        },
        zombieKeys: {
            type: "warning",
            fix: false,
        },
        emptyKeys: {
            type: "warning",
        },
        misprintKeys: {
            type: "warning",
            coefficient: 0.9,
            ignored: [],
        },
        deepSearch: {
            type: "disable",
        },
        maxWarning: 0,
        ignoredKeys: [],
        customRegExpToFindKeys: [],
        namespaceKeys: {
            type: 'disable',
            delimiter: '.',          // use ':' for react-i18next
            namespaces: {
                'bonus':        ['apps/bonus', 'apps/bonus-detail'],
                'registration': ['apps/registration', 'apps/auth'],
            },
            globalNamespaces: ['g', 'form', 'nav', 'popup'],
            ignoreInFolders: ['component-kit'],
        },
        maxKeyDepth: {
            type: "disable",
            depth: 3,
        },
        duplicateKeys: {
            type: "disable",
        },
        missingTranslations: {
            type: "disable",
            fix: false,
        },
    },
    fetch: {
        requestQuery: "",
        requestHeaders: {},
        responseQuery: "",
        get: async () => {
            const requestOne = fetch('https://raw.githubusercontent.com/romanrostislavovich/translate-lint/refs/heads/develop/test/integration/angular-ngx-translate/inputs/locales/EN-eu.json');
            const requestTwo = fetch('https://raw.githubusercontent.com/romanrostislavovich/translate-lint/refs/heads/develop/test/integration/angular-ngx-translate/inputs/locales/EN-us.json');
            const result = await Promise.all([requestOne, requestTwo]).then(async ([responseOne, responseTwo]) => {
                return {
                    ...(await responseOne.json()),
                    ...(await  responseTwo.json())
                }
            });
            return result;
        }
    },
    project: "./src/app/**/*.{html,ts}",
    languages: "./src/assets/i18n/*.{json,yaml,yml}",
    frameworkPreset: "angular-ngx-translate",
}

export default config;