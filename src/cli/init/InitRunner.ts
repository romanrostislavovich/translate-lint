import readline from 'readline';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { config } from '../../core/config';

const FRAMEWORKS: string[] = [
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
    const d: typeof config.defaultValues = config.defaultValues;
    const cfg: object = {
        frameworkPreset: framework,
        project,
        languages,
        format: d.format,
        rule: d.rule,
        fetch: {
            requestQuery:   d.fetch.requestQuery,
            requestHeaders: d.fetch.requestHeaders,
            responseQuery:  d.fetch.responseQuery,
        },
    };
    const jsonIndent: number = 2;
    return JSON.stringify(cfg, null, jsonIndent) + '\n';
}

function generateJsConfig(framework: string, project: string, languages: string): string {
    const d: typeof config.defaultValues = config.defaultValues;
    const r: typeof d.rule = d.rule;
    const ns: typeof r.namespaceKeys = r.namespaceKeys!;
    const mkd: typeof r.maxKeyDepth = r.maxKeyDepth!;
    const dk: typeof r.duplicateKeys = r.duplicateKeys!;
    const mt: typeof r.missingTranslations = r.missingTranslations!;
    const knc: typeof r.keyNamingConvention = r.keyNamingConvention!;
    return `export default {
  frameworkPreset: '${framework}',
  project: '${project}',
  languages: '${languages}',
  format: '${d.format}',  // 'stylish' | 'json'
  rule: {
    keysOnViews:           { type: '${r.keysOnViews.type}' },
    zombieKeys:            { type: '${r.zombieKeys.type}', fix: ${r.zombieKeys.fix} },
    emptyKeys:             { type: '${r.emptyKeys.type}' },
    misprintKeys:          { type: '${r.misprintKeys.type}', coefficient: ${r.misprintKeys.coefficient}, ignored: [] },
    deepSearch:            { type: '${r.deepSearch.type}' },
    maxWarning:            ${r.maxWarning},
    ignoredKeys:           [],
    customRegExpToFindKeys: [],
    namespaceKeys: {
      type:             '${ns.type}',
      delimiter:        '${ns.delimiter}',
      namespaces:       {},
      globalNamespaces: [],
      ignoreInFolders:  [],
    },
    maxKeyDepth:           { type: '${mkd.type}', depth: ${mkd.depth} },
    duplicateKeys:         { type: '${dk.type}' },
    missingTranslations:   { type: '${mt.type}', fix: ${mt.fix} },
    keyNamingConvention:   { type: '${knc.type}', format: '${knc.format}' },  // SCREAMING_SNAKE | camelCase | snake_case | kebab-case | PascalCase
  },
  fetch: {
    requestQuery:   '${d.fetch.requestQuery}',
    requestHeaders: {},
    responseQuery:  '${d.fetch.responseQuery}',
    // get: async () => { return await fetch('https://...').then(r => r.json()); },
  },
};
`;
}

async function runInit(): Promise<void> {
    const rl: readline.Interface = readline.createInterface({ input: process.stdin, output: process.stdout });

    // tslint:disable-next-line:no-console
    console.log(chalk.cyan('\nWelcome to translate-lint config generator!\n'));

    const formatAnswer: string = await ask(rl, `${chalk.bold('Config format')} (json/js) ${chalk.gray('[json]')}: `);
    const format : string = formatAnswer.trim().toLowerCase() || 'json';
    const useJs: boolean = format === 'js';

    // tslint:disable-next-line:no-console
    console.log(`\n${chalk.bold('Available framework presets:')}`);
    FRAMEWORKS.forEach((f, i) => {
        // tslint:disable-next-line:no-console
        console.log(`  ${chalk.yellow(String(i + 1))}. ${f}`);
    });

    const frameworkAnswer: string = await ask(rl, `\n${chalk.bold('Select framework preset')} (1–${FRAMEWORKS.length}) ${chalk.gray('[1]')}: `);
    const frameworkIndex: number = Number(frameworkAnswer.trim() || '1') - 1;
    const framework : string = FRAMEWORKS[Math.max(0, Math.min(frameworkIndex, FRAMEWORKS.length - 1))];

    const defaultProject: string = DEFAULT_PROJECT_PATHS[framework];
    const projectAnswer: string = await ask(rl, `${chalk.bold('Project path')} ${chalk.gray(`[${defaultProject}]`)}: `);
    const project: string = projectAnswer.trim() || defaultProject;

    const defaultLang: string = DEFAULT_LANG_PATHS[framework];
    const langAnswer: string = await ask(rl, `${chalk.bold('Languages path')} ${chalk.gray(`[${defaultLang}]`)}: `);
    const languages: string = langAnswer.trim() || defaultLang;

    const defaultFilename: string = `translate-lint.config.${useJs ? 'js' : 'json'}`;
    const fileAnswer: string = await ask(rl, `${chalk.bold('Output file name')} ${chalk.gray(`[${defaultFilename}]`)}: `);
    const filename: string = fileAnswer.trim() || defaultFilename;

    rl.close();

    const outputPath: string = path.resolve(process.cwd(), filename);
    const content: string = useJs
        ? generateJsConfig(framework, project, languages)
        : generateJsonConfig(framework, project, languages);

    fs.writeFileSync(outputPath, content, 'utf-8');

    // tslint:disable-next-line:no-console
    console.log(chalk.green(`\n✓ Created ${filename}`));
    // tslint:disable-next-line:no-console
    console.log(`\nRun: ${chalk.cyan(`translate-lint --config ./${filename}`)}\n`);
}

export { runInit };