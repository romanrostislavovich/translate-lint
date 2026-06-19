# translate-lint

> Simple tools for checking translate keys in the whole app that uses regexp. Support for popular libraries and frameworks

[![semantic](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm](https://img.shields.io/npm/v/translate-lint.svg)](https://www.npmjs.com/package/translate-lint)
[![download npm](https://img.shields.io/npm/dm/translate-lint.svg)](https://www.npmjs.com/package/translate-lint)

> for `desktop` use  [`ngx-translate-editor`](https://github.com/svoboda-rabstvo/ngx-translate-editor) 

## Table of Contents

- [Background](#background)
- [Installation](#installation)
- [Usage](#usage)
    - [CLI](#cli)
    - [TypeScript](#typescript)
- [Rules](#rules)
    - [namespaceKeys](#namespacekeysrule)
- [Contribute](#contribute)
- [Used By](#used-by)
- [License](#license)

## Background

There are a lot of translation keys in the whole app.
This repository contains a proposal to check all translation keys in the whole app
which should exist in all languages files.

### Support 

| Library                                                          | Preset                  | Framework |
|------------------------------------------------------------------|-------------------------|-----------|
| [ngx-translate][ngx-translate]                                   | `angular-ngx-translate` | Angular   |
| [react-i18next](https://www.npmjs.com/package/react-i18next)     | `react-i18next`         | React     |
| [react-intl](https://www.npmjs.com/package/react-intl)           | `react-intl`            | React     |
| [lingui](https://github.com/lingui/js-lingui)                    | `lingui-js`             | React     |
| [next-intl](https://www.npmjs.com/package/next-intl)             | `next-intl`             | Next.js   |
| [vue-i18n](https://vue-i18n.intlify.dev/)                        | `vue-i18n`              | Vue       |
| [i18next-vue](https://www.npmjs.com/package/i18next-vue)         | `i18next-vue`           | Vue       |
| [fluent-vue](https://fluent-vue.demivan.me/)                     | `fluent-vue`            | Vue       |

## Installation

### NPM

```bash
npm install translate-lint -g
```

## Usage

### CLI

```text

Usage: translate-lint [options]

Simple tools for checking translate keys in the whole app that uses regexp. Support for popular libraries and frameworks

Options:
 -f, --frameworkPreset [enum] (required)   
          Preset of frameworks and libraries
          Possible Values: <angular-ngx-translate|lingui-js|next-intl|react-intl|react-i18next|vue-i18n|i18next-vue|fluent-vue>
  -p, --project [glob]                   
          The path to project folder
          Possible Values: <relative path|absolute path>
           (default: "./src/app/**/*.{html,ts,resx}")
  -l, --languages [glob]                 
          The path to languages folder
          Possible Values: <relative path|absolute path|URL>
          Supported formats: .json, .yaml, .yml
           (default: "./src/assets/i18n/*.{json,yaml,yml}")
  --kv, --keysOnViews [enum]             
          Described how to handle the error of missing keys on view
          Possible Values: <disable|warning|error>
           (default: "error")
  --zk, --zombieKeys [enum]              
          Described how to handle the error of zombies keys. Zombie keys are keys that doesn't exist on any languages file but exist on project, or exist languages but doesn't exist on project
          Possible Values: <disable|warning|error>
           (default: "warning")
  --ek, --emptyKeys [enum]               
          Described how to handle empty value on translate keys. Empty keys are keys that doesn't have any value on languages files
          Possible Values: <disable|warning|error>
           (default: "warning")
  -i, --ignore [glob]                    
          Ignore projects and languages files
          Possible Values: <relative path|absolute path>
          
  --maxWarning [glob]                    
         Max count of warnings in all files. If this value more that count of warnings, then an error is return
          Possible Values: <number>
           (default: "0")
  --mk, --misprintKeys [enum]            
          Try to find matches with misprint keys on views and languages keys. Coefficient: 0.9. Can be longer process!!
          Possible Values: <disable|warning|error>
           (default: "disable")
  --ds, --deepSearch [enum]              
          Add each translate key to global regexp end try to find them on project. Can be longer process!!
          Possible Values: <disable|enable>
           (default: "disable")
  --mc, --misprintCoefficient [number]   
          Coefficient for misprint option can be from 0 to 1.0.     
          (default: "0.9")
  -c, --config [path]                    
          Path to config via JSON or JS file
          Possible Values: <relative path|absolute path>
          
  --fz, --fixZombiesKeys [boolean]       
          Auto fix zombies keys on languages files
          
          
  -v, --version                          Print current version of translate-lint
  -h, --help                             display help for command


Examples:

    $ translate-lint -p './src/app/**/*.{html,ts,resx}' -l './src/assets/i18n/*.json' -f angular-ngx-translate
    $ translate-lint -p './src/app/**/*.{html,ts,resx}' -z disable -v error -f react-i18next
    $ translate-lint -p './src/app/**/*.{html,ts,resx}' -i './src/assets/i18n/EN-us.json, ./src/app/app.*.{json}' -f react-intl
    $ translate-lint -p './src/app/**/*.{html,ts,resx}' -l 'https://8.8.8.8/locales/EN-eu.json' -f lingui-js
```    

> NOTE: For `project` and `languages` options need to include file types like on the example.

Default JSON Config is:
```json
{
    "rules": {
        "keysOnViews": "error",
        "zombieKeys": "warning",
        "misprintKeys": "disable",
        "deepSearch": "disable",
        "emptyKeys": "warning",
        "maxWarning": "0",
        "misprintCoefficient": "0.9",
        "ignoredKeys": [ "IGNORED.KEY.(.*)" ],
        "ignoredMisprintKeys": [],
        "customRegExpToFindKeys": [ "(?<=marker\\(['\"])([A-Za-z0-9_\\-.]+)(?=['\"]\\))"],
        "namespaceKeys": {
            "type": "disable",
            "delimiter": ".",
            "namespaces": {},
            "globalNamespaces": [],
            "ignoreInFolders": []
        }
    },
    "fetch": {
        "requestQuery": "",
        "requestHeaders": {},
        "responseQuery": ""
    },
    "fixZombiesKeys": false,
    "project": "./src/app/**/*.{html,ts}",
    "languages": "./src/assets/i18n/*.{json,yaml,yml}",
    "frameworkPreset": "angular-ngx-translate"
}
```

JS Config should have `default` export via object like config. See example:

Example JS config is:
```javascript

const config = {
    rules: {
        keysOnViews: "error",
        zombieKeys: "warning",
        emptyKeys: "warning",
        misprint: {
            type: "warning",
            coefficient: 0.9
        },
        ignoredKeys: [],
        ignoredMisprintKeys: [],
        namespaceKeys: {
            type: 'error',
            delimiter: '.',       // use ':' for react-i18next (e.g. t('bonus:TITLE'))
            namespaces: {
                'bonus':      ['apps/bonus', 'apps/bonus-detail'],
                'registration': ['apps/registration', 'apps/auth'],
            },
            globalNamespaces: ['g', 'form', 'nav', 'popup'],
            ignoreInFolders: ['sandbox-component-kit'],
        },
    },
    fetch: {
        requestQuery: "",
        requestHeaders: {},
        responseQuery: "",
        get: async () => {
            const requestOne = fetch('https://8.8.8.8/locales/EN-eu.json');
            const requestTwo = fetch('https://8.8.8.8/locales/EN-us.json');
            const result = await Promise.all([requestOne, requestTwo]).then(async ([responseOne, responseTwo]) => {
                return {
                    ...(await responseOne.json()),
                    ...(await  responseTwo.json())
                }
            });
            // NOTE: result should contains only translation keys. Example 
            // {
            //   "translation.key": "value"
            // }
            return result;
        }
    },
    fixZombiesKeys: false,
    project: "./src/app/**/*.{html,ts}",
    languages: "./src/assets/i18n/*.{json,yaml,yml}",
    frameworkPreset: "angular-ngx-translate"
}

export default config;
```

#### How to write Custom RegExp

We have `(?<=marker\\(['\"])([A-Za-z0-9_\\-.]+)(?=['\"]\\))` RegExp witch contains of 3 parts:

- Prefix - `(?<=marker\\(['\"])`
   - This construction tells that what we need matching before translate key
   - start with `(?<=` and end `)`.
   - `marker\\(['\"]` - tells that we try to find word `market` witch have on the second character `'`or `"`
   - To summarize, we are trying to find keys before each word to be `market` and commas `'` or `"`
  
- Matching for key: `([A-Za-z0-9_\\-.]+)`
  - This construction tells that we find and save all words which contain alphabet, numbers, and `_` or `-`.
  - We recommend using this part of RegExp to find and save translated keys
  - But you can also use `(.*)` If it's enough for your project
- Postfix - `(?=['\"]\\))` (the same as prefix, but need to be ended)
  - This construction tells that what we need matching after translate key
  - start with `(?=` and end `)`
  - `['\"]\\)` - tells that we try to find word comas `'` or `"` and ended with `)`
  - To summarize, we are trying to find keys ended each word to be commas `'` or `"` and `)`

Example RegExp will find following keys
  - `marker('TRSNLATE.KEY')`
  - `marker("TRSNLATE.KEY-2")`

#### Exit Codes

The CLI process may exit with the following codes:

- `0`: Linting succeeded without errors (warnings may have occurred)
- `1`: Linting failed with one or more rule violations with severity error
- `2`: An invalid command line argument or combination thereof was used

### TypeScript

```typescript
import {
  ToggleRule,
  TranslateLint,
  IRulesConfig,
  INamespaceRule,
  ResultCliModel,
  ErrorTypes,
  LanguagesModel,
  IFetch,
  libraries,
  Libraries
} from 'translate-lint';

const libraryPreset: Libraries = Libraries.angularNgxTranslate;
const viewsPath: string = './src/app/**/*.{html,ts}';
const languagesPath: string = './src/assets/i18n/*.json';
const ignoredLanguagesPath: string = "./src/assets/i18n/ru.json, ./src/assets/i18n/ru-RU.json";

const namespaceRule: INamespaceRule = {
  type: ErrorTypes.error,
  delimiter: '.',
  namespaces: {
    'bonus': ['apps/bonus', 'apps/bonus-detail'],
    'registration': ['apps/registration', 'apps/auth'],
  },
  globalNamespaces: ['g', 'form', 'nav', 'popup'],
  ignoreInFolders: ['sandbox-component-kit'],
};

const ruleConfig: IRulesConfig = {
  keysOnViews: ErrorTypes.error,
  zombieKeys: ErrorTypes.warning,
  misprintKeys: ErrorTypes.disable,
  deepSearch: ToggleRule.disable,
  emptyKeys: ErrorTypes.warning,
  maxWarning: 0,
  misprintCoefficient: 0.9,
  ignoredKeys: ['EXAMPLE.KEY', 'IGNORED.KEY.(.*)'],
  ignoredMisprintKeys: [],
  customRegExpToFindKeys: ["(?<=marker\\(['\"])([A-Za-z0-9_\\-.]+)(?=['\"]\\))"],
  namespaceKeys: namespaceRule,
};
const fixZombiesKeys: boolean = false;
const fetchSettings: IFetch = {
  requestQuery: "",
  requestHeaders: {},
  responseQuery: "",
  get: () => {
    // You fetch to get locales
  }
};

const regexpToFindKeys = libraries.get(libraryPreset);
const translateLint = new TranslateLint(viewsPath, languagesPath, ignoredLanguagesPath, ruleConfig, fixZombiesKeys, fetchSettings, regexpToFindKeys)
const resultLint: ResultCliModel = translateLint.lint(); // Run Lint
const languages: LanguagesModel[] = translateLint.getLanguages()  // Get Languages with all keys and views

```

## Rules

### namespaceKeys

The `namespaceKeys` rule enforces that translation keys belonging to a specific namespace are only used in the allowed project folders. This helps maintain feature boundaries in large monorepo or multi-module applications.

**How it works:**

1. A key like `bonus.TITLE` is split by `delimiter` (`.`) → namespace is `bonus`
2. If `bonus` is in `globalNamespaces` → allowed everywhere, no error
3. If the file is in any path from `ignoreInFolders` → skipped entirely
4. If `bonus` is declared in `namespaces` → the view file must be inside one of the allowed folders
5. If none of the allowed folders match → error or warning (based on `type`)

**Config options:**

| Option | Type | Description |
|---|---|---|
| `type` | `error` \| `warning` \| `disable` | Severity of the rule |
| `delimiter` | `string` | Character separating namespace from key. Use `.` for most libraries, `:` for react-i18next |
| `namespaces` | `Record<string, string[]>` | Map of namespace → list of allowed folder paths |
| `globalNamespaces` | `string[]` | Namespaces allowed in any folder (e.g. shared UI keys) |
| `ignoreInFolders` | `string[]` | Folder paths where namespace checks are skipped entirely |

**Delimiter by library:**

| Library | Delimiter | Example in template |
|---|---|---|
| ngx-translate | `.` | `'bonus.TITLE' \| translate` |
| react-i18next | `:` | `t('bonus:TITLE')` |
| react-intl | `.` | `<FormattedMessage id="bonus.TITLE" />` |
| lingui | `.` | `` t`bonus.TITLE` `` |
| next-intl | `.` | `t('bonus.TITLE')` |

**Error message example:**
```
Key 'bonus.TITLE' is not allowed in 'apps/dashboard/component.html'. Allowed folders: apps/bonus, apps/bonus-detail
```

## Contribute

You may contribute in several ways like requesting new features,
adding tests, fixing bugs, improving documentation or examples.
Please check our [contributing guidelines][contributing].

## Used By

Here can be your extensions:

- [ngx-translate-editor](https://github.com/svoboda-rabstvo/ngx-translate-editor) - Simple GUI for CRUD translate keys of ngx-translate, which included ngx-translate-lint
- [121 Platform](https://github.com/global-121/121-platform) - 121 is an open source platform for Cash based Aid built with Digital Identity & Local/Global Financial service partners.

## License


[MIT][license-url]

[ngx-translate]: https://github.com/ngx-translate/core
[semantic-shield]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[npm-shield]: https://img.shields.io/npm/v/svoboda-rabstvo/translate-lint.svg
[npm-url]: https://www.npmjs.com/package/translate-lint
[npm]: https://www.npmjs.com
[node-js]: https://nodejs.org
[github-shield]: https://img.shields.io/github/release/svoboda-rabstvo/translate-lint.svg?label=github
[github-url]: https://github.com/svoboda-rabstvo/translate-lint
[github-release-url]: https://github.com/svoboda-rabstvo/translate-lint/releases
[github-pages-url]: https://svoboda-rabstvo.github.io/translate-lint/
[schema-url]: http://json-schema.org/
[web-url]: https://schema.linterhub.com
[doc-url]: https://github.com/svoboda-rabstvo/translate-lint/blob/develop/doc
[license-url]: https://github.com/svoboda-rabstvo/translate-lint/blob/develop/LICENSE.md
[meta-url]: https://en.wikipedia.org/wiki/List_of_software_package_management_systems#Meta_package_managers
[contributing]: https://github.com/svoboda-rabstvo/translate-lint/blob/master/.github/CONTRIBUTING.md
