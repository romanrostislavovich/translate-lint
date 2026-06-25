import readline from 'readline';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const FRAMEWORKS = [
    'angular-ngx-translate',
    'react-i18next',
    'react-intl',
    'lingui-js',
    'next-intl',
    'vue-i18n',
    'i18next-vue',
    'fluent-vue',
];

const DEFAULT_PROJECT_PATHS: Record<string, string> = {
    'angular-ngx-translate': './src/app/**/*.{html,ts}',
    'react-i18next':         './src/**/*.{tsx,ts,jsx,js}',
    'react-intl':            './src/**/*.{tsx,ts,jsx,js}',
    'lingui-js':             './src/**/*.{tsx,ts,jsx,js}',
    'next-intl':             './src/**/*.{tsx,ts,jsx,js}',
    'vue-i18n':              './src/**/*.{vue,ts,js}',
    'i18next-vue':           './src/**/*.{vue,ts,js}',
    'fluent-vue':            './src/**/*.{vue,ts,js}',
};

const DEFAULT_LANG_PATHS: Record<string, string> = {
    'angular-ngx-translate': './src/assets/i18n/*.json',
    'react-i18next':         './public/locales/**/*.json',
    'react-intl':            './src/locales/*.json',
    'lingui-js':             './src/locales/*.json',
    'next-intl':             './messages/*.json',
    'vue-i18n':              './src/locales/*.json',
    'i18next-vue':           './src/locales/*.json',
    'fluent-vue':            './src/locales/*.json',
};

function ask(rl: readline.Interface, question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, resolve));
}

function generateJsonConfig(framework: string, project: string, languages: string): string {
    const cfg = {
        frameworkPreset: framework,
        project,
        languages,
        format: 'stylish',
        rule: {
            keysOnViews:          { type: 'error' },
            zombieKeys:           { type: 'warning', fix: false },
            emptyKeys:            { type: 'warning' },
            misprintKeys:         { type: 'disable', coefficient: 0.9, ignored: [] },
            deepSearch:           { type: 'disable' },
            maxWarning:           0,
            ignoredKeys:          [],
            customRegExpToFindKeys: [],
            namespaceKeys: {
                type:             'disable',
                delimiter:        '.',
                namespaces:       {},
                globalNamespaces: [],
                ignoreInFolders:  [],
            },
            maxKeyDepth:          { type: 'disable', depth: 4 },
            duplicateKeys:        { type: 'disable' },
            missingTranslations:  { type: 'disable', fix: false },
            keyNamingConvention:  { type: 'disable', format: 'SCREAMING_SNAKE' },
        },
        fetch: {
            requestQuery:   '',
            requestHeaders: {},
            responseQuery:  '',
        },
    };
    return JSON.stringify(cfg, null, 2) + '\n';
}

function generateJsConfig(framework: string, project: string, languages: string): string {
    return `export default {
  frameworkPreset: '${framework}',
  project: '${project}',
  languages: '${languages}',
  format: 'stylish',  // 'stylish' | 'json'
  rule: {
    keysOnViews:           { type: 'error' },
    zombieKeys:            { type: 'warning', fix: false },
    emptyKeys:             { type: 'warning' },
    misprintKeys:          { type: 'disable', coefficient: 0.9, ignored: [] },
    deepSearch:            { type: 'disable' },
    maxWarning:            0,
    ignoredKeys:           [],
    customRegExpToFindKeys: [],
    namespaceKeys: {
      type:             'disable',
      delimiter:        '.',
      namespaces:       {},
      globalNamespaces: [],
      ignoreInFolders:  [],
    },
    maxKeyDepth:           { type: 'disable', depth: 4 },
    duplicateKeys:         { type: 'disable' },
    missingTranslations:   { type: 'disable', fix: false },
    keyNamingConvention:   { type: 'disable', format: 'SCREAMING_SNAKE' },  // SCREAMING_SNAKE | camelCase | snake_case | kebab-case | PascalCase
  },
  fetch: {
    requestQuery:   '',
    requestHeaders: {},
    responseQuery:  '',
    // get: async () => { return await fetch('https://...').then(r => r.json()); },
  },
};
`;
}

async function runInit(): Promise<void> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    // tslint:disable-next-line:no-console
    console.log(chalk.cyan('\nWelcome to translate-lint config generator!\n'));

    const formatAnswer = await ask(rl, `${chalk.bold('Config format')} (json/js) ${chalk.gray('[json]')}: `);
    const format = formatAnswer.trim().toLowerCase() || 'json';
    const useJs = format === 'js';

    // tslint:disable-next-line:no-console
    console.log(`\n${chalk.bold('Available framework presets:')}`);
    FRAMEWORKS.forEach((f, i) => {
        // tslint:disable-next-line:no-console
        console.log(`  ${chalk.yellow(String(i + 1))}. ${f}`);
    });

    const frameworkAnswer = await ask(rl, `\n${chalk.bold('Select framework preset')} (1–${FRAMEWORKS.length}) ${chalk.gray('[1]')}: `);
    const frameworkIndex = parseInt(frameworkAnswer.trim() || '1', 10) - 1;
    const framework = FRAMEWORKS[Math.max(0, Math.min(frameworkIndex, FRAMEWORKS.length - 1))];

    const defaultProject = DEFAULT_PROJECT_PATHS[framework];
    const projectAnswer = await ask(rl, `${chalk.bold('Project path')} ${chalk.gray(`[${defaultProject}]`)}: `);
    const project = projectAnswer.trim() || defaultProject;

    const defaultLang = DEFAULT_LANG_PATHS[framework];
    const langAnswer = await ask(rl, `${chalk.bold('Languages path')} ${chalk.gray(`[${defaultLang}]`)}: `);
    const languages = langAnswer.trim() || defaultLang;

    const defaultFilename = `translate-lint.config.${useJs ? 'js' : 'json'}`;
    const fileAnswer = await ask(rl, `${chalk.bold('Output file name')} ${chalk.gray(`[${defaultFilename}]`)}: `);
    const filename = fileAnswer.trim() || defaultFilename;

    rl.close();

    const outputPath = path.resolve(process.cwd(), filename);
    const content = useJs
        ? generateJsConfig(framework, project, languages)
        : generateJsonConfig(framework, project, languages);

    fs.writeFileSync(outputPath, content, 'utf-8');

    // tslint:disable-next-line:no-console
    console.log(chalk.green(`\n✓ Created ${filename}`));
    // tslint:disable-next-line:no-console
    console.log(`\nRun: ${chalk.cyan(`translate-lint --config ./${filename}`)}\n`);
}

export { runInit };