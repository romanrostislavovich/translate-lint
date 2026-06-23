#!/usr/bin/env node
import commander, { Option } from 'commander';

import { OptionModel } from './models';
import {
    ErrorTypes,
    FatalErrorModel,
    IRulesConfig,
    TranslateLint,
    ResultCliModel,
    ResultModel,
    StatusCodes,
    ToggleRule,
    parseJsonFile,
    getPackageJsonPath, IFetch, PathUtils,
    libraries, Libraries
} from "./../core";

import { config } from './../core/config';
import { OptionsLongNames } from './enums';
import chalk from 'chalk';
import path from 'path';

const name: string = 'translate-lint';

// tslint:disable-next-line:no-any
const docs: any = {
    name,
    usage: '[options]',
    description: 'Simple tools for checking translate keys in the whole app that uses regexp. Support for popular libraries and frameworks',
    examples: `

Examples:

    $ ${name} -p '${config.defaultValues.project}' -l '${config.defaultValues.languages}' -f angular-ngx-translate
    $ ${name} -p '${config.defaultValues.project}' -zk ${ErrorTypes.disable} -kv ${ErrorTypes.error} -f react-i18next
    $ ${name} -p '${config.defaultValues.project}' -i './src/assets/i18n/EN-us.json, ./src/app/app.*.{json}' -f react-intl
    $ ${name} -p '${config.defaultValues.project}' -l 'https://8.8.8.8/locales/EN-eu.json' -f lingui-js

`
};

class Cli {
    // tslint:disable-next-line:no-any
    private cliClient: any = commander.program;
    private cliOptions: OptionModel[] = [];

    constructor(options: OptionModel[]) {
        this.cliOptions = options;
    }

    public static async run(options: OptionModel[]): Promise<void> {
        const cli: Cli = new Cli(options);
        cli.init();
        cli.parse();
        await cli.runCli();
    }

    public init(options: OptionModel[] = this.cliOptions): void {
        options.forEach((option: OptionModel) => {
            const optionFlag: string = option.getFlag();
            const optionDescription: string = option.getDescription();
            const optionDefaultValue: string | ErrorTypes | undefined = option.default;
            const commandOption: Option = new Option(optionFlag, optionDescription).default(optionDefaultValue);
            this.cliClient.addOption(commandOption);
        });

        this.cliClient.allowExcessArguments(true);
        // tslint:disable-next-line:no-any
        const packageJson: any = parseJsonFile(getPackageJsonPath());
        this.cliClient.version(packageJson.version, '-v, --version', `Print current version of ${name}`);

        this.cliClient
            .name(docs.name)
            .usage(docs.usage)
            .description(docs.description)
            .on(`--${OptionsLongNames.help}`, () => {
                // tslint:disable-next-line:no-console
                console.log(docs.examples);
            });
    }

    public async runCli(): Promise<void> {
        try {
            const fileOptions: any = await this.getConfig(this.cliClient.opts().config);
            const commandOptions: any = this.cliClient.opts();
            const defaultOptions: any = config.defaultValues;

            const defaultRule = defaultOptions.rule;
            const fileRule = fileOptions?.rule || {};

            const pick = (...values: any[]) => values.find(v => v !== undefined && v !== null);

            const rule: IRulesConfig = {
                zombieKeys: {
                    type: commandOptions.zombieKeys || fileRule.zombieKeys?.type || defaultRule.zombieKeys.type,
                    fix: pick(commandOptions.fixZombiesKeys, fileRule.zombieKeys?.fix, defaultRule.zombieKeys.fix),
                },
                keysOnViews: {
                    type: commandOptions.keysOnViews || fileRule.keysOnViews?.type || defaultRule.keysOnViews.type,
                },
                emptyKeys: {
                    type: commandOptions.emptyKeys || fileRule.emptyKeys?.type || defaultRule.emptyKeys.type,
                },
                misprintKeys: {
                    type: commandOptions.misprintKeys || fileRule.misprintKeys?.type || defaultRule.misprintKeys.type,
                    coefficient: pick(commandOptions.misprintCoefficient, fileRule.misprintKeys?.coefficient, defaultRule.misprintKeys.coefficient),
                    ignored: fileRule.misprintKeys?.ignored || defaultRule.misprintKeys.ignored,
                },
                deepSearch: {
                    type: commandOptions.deepSearch || fileRule.deepSearch?.type || defaultRule.deepSearch.type,
                },
                maxWarning: pick(commandOptions.maxWarning, fileRule.maxWarning, defaultRule.maxWarning),
                ignoredKeys: fileRule.ignoredKeys || defaultRule.ignoredKeys,
                customRegExpToFindKeys: fileRule.customRegExpToFindKeys || defaultRule.customRegExpToFindKeys,
                namespaceKeys: fileRule.namespaceKeys || defaultRule.namespaceKeys,
                maxKeyDepth: fileRule.maxKeyDepth || defaultRule.maxKeyDepth,
                duplicateKeys: {
                    type: commandOptions.duplicateKeys || fileRule.duplicateKeys?.type || defaultRule.duplicateKeys?.type,
                },
                missingTranslations: {
                    type: commandOptions.missingTranslations || fileRule.missingTranslations?.type || defaultRule.missingTranslations?.type,
                    fix: pick(commandOptions.fixMissingKeys, fileRule.missingTranslations?.fix, defaultRule.missingTranslations?.fix),
                },
            };

            const projectPath: string = commandOptions.project || fileOptions?.project || defaultOptions.project;
            const languagePath: string = commandOptions.languages || fileOptions?.languages || defaultOptions.languages;
            const optionIgnore: string = commandOptions.ignore;
            const fetchSettings: IFetch = fileOptions?.fetch || defaultOptions.fetch;
            const frameworkPreset: Libraries = commandOptions.frameworkPreset || fileOptions?.frameworkPreset || defaultOptions.frameworkPreset;

            if (projectPath && languagePath && !!frameworkPreset) {
                await this.runLint(projectPath, languagePath, frameworkPreset, rule, optionIgnore, rule.maxWarning, fetchSettings);
            } else {
                const cliHasError: boolean = this.validate({ project: projectPath, languages: languagePath, frameworkPreset });
                if (cliHasError) {
                    process.exit(StatusCodes.crash);
                } else {
                    this.cliClient.help();
                }
            }
        } catch (error) {
            // tslint:disable-next-line: no-console
            console.error(error);
            process.exitCode = StatusCodes.crash;
        } finally {
            process.exit();
        }
    }

    // tslint:disable-next-line:no-any
    public async getConfig(configPath: string): Promise<any> {
        if (!configPath) {
            return {};
        }

        const extension: string = path.extname(configPath);

        if (extension === '.json') {
            return parseJsonFile(configPath);
        }

        if (extension === '.js') {
            const correctConfigPath: string = PathUtils.resolvePath(configPath);
            const result: any =  await import(correctConfigPath);
            return result.default;
        }
    }

    public parse(): void {
        this.printCurrentVersion();

        this.cliClient.parse(process.argv);
    }

    private validate(options: any): boolean {
        if (!options.project) {
            // tslint:disable-next-line: no-console
            console.error(`Missing required argument: --project`);
            return true;
        }

        if (!options.languages) {
            // tslint:disable-next-line: no-console
            console.error(`Missing required argument: --languages`);
            return true;
        }

        if (!options.frameworkPreset) {
            // tslint:disable-next-line: no-console
            console.error(`Missing required argument: --frameworkPreset`);
            return true;
        }

        return false;
    }

    public async runLint(
        project: string,
        languages: string,
        frameworkPreset: Libraries,
        ruleConfig: IRulesConfig,
        ignore?: string,
        maxWarning: number = 0,
        fetchSettings?: IFetch,
    ): Promise<void> {
            const regexpList: string[] | undefined = libraries.get(frameworkPreset);
            const validationModel: TranslateLint = new TranslateLint(project, languages, ignore, ruleConfig, fetchSettings, regexpList);
            const resultCliModel: ResultCliModel = await validationModel.lint(maxWarning);
            const resultModel: ResultModel = resultCliModel.getResultModel();
            resultModel.printResult();
            resultModel.printSummery();

            process.exitCode = resultCliModel.exitCode();

            if (resultModel.hasError) {
                throw new FatalErrorModel(chalk.red(resultModel.message));
            }
    }

    private printCurrentVersion(): void {
        // tslint:disable-next-line:no-any
        const packageJson: any = parseJsonFile(getPackageJsonPath());
        // tslint:disable-next-line:no-console
        console.log(`Current version: ${packageJson.version}`);
    }
}

export { Cli };