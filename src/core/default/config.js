
const config = {
    rules: {
        keysOnViews: "error",
        zombieKeys: "warning",
        emptyKeys: "warning",
        misprint: {
            "type": "warning",
            "coefficient": 0.9
        },
        ignoredKeys: [],
        ignoredMisprintKeys: [],
        namespaceKeys: {
            type: 'disable',
            delimiter: '.',          // use ':' for react-i18next
            namespaces: {
                'bonus':      ['apps/bonus', 'apps/bonus-detail'],
                'registration': ['apps/registration', 'apps/auth'],
            },
            globalNamespaces: ['g', 'form', 'nav', 'popup'],
            ignoreInFolders: ['component-kit'],
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
    fixZombiesKeys: false,
    project: "./src/app/**/*.{html,ts}",
    languages: "./src/assets/i18n/*.{json,yaml,yml}",
    frameworkPreset: "angular-ngx-translate",
}

export default config;

