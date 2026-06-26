#!/usr/bin/env node
import commander, { Option } from 'commander';

import { OptionModel } from './models';
import {
    ErrorTypes,
    FatalErrorModel,
    IDefaultValues,
    IRulesConfig,
    NamingConvention,
    OutputFormat,
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
import { runInit } from './init/InitRunner';
import chalk from 'chalk';
import path from 'path';

interface ICommandOptions {
    init?: boolean;
    config?: string;
    ignore?: string;
    project?: string;
    languages?: string;
    frameworkPreset?: string;
    zombieKeys?: string;
    fixZombiesKeys?: string;
    keysOnViews?: string;
    emptyKeys?: string;
    misprintKeys?: string;
    misprintCoefficient?: string;
    deepSearch?: string;
    maxWarning?: string;
    duplicateKeys?: string;
    missingTranslations?: string;
    fixMissingKeys?: string;
    keyNamingConvention?: string;
    keyNamingConventionFormat?: string;
    format?: string;
}

interface IFileConfig {
    project?: string;
    languages?: string;
    frameworkPreset?: string;
    format?: string;
    rule?: Partial<IRulesConfig>;
    fetch?: IFetch;
}

interface IValidateOptions {
    project: string;
    languages: string;
    frameworkPreset: string;
}

function pick<T>(...values: Array<T | undefined | null>): T | undefined {
    return values.find((v): v is T => v !== undefined && v !== null);
}

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
            const commandOptions: ICommandOptions = this.cliClient.opts() as ICommandOptions;

            if (commandOptions.init) {
                await runInit();
                return;
            }

            const fileOptions: IFileConfig = await this.getConfig(commandOptions.config);
            const defaultOptions: IDefaultValues = config.defaultValues;

            const defaultRule: IRulesConfig = defaultOptions.rule;
            const fileRule: Partial<IRulesConfig> = fileOptions?.rule || {};

            const rule: IRulesConfig = {
                zombieKeys: {
                    type: (commandOptions.zombieKeys || fileRule.zombieKeys?.type || defaultRule.zombieKeys.type) as ErrorTypes,
                    fix: pick(commandOptions.fixZombiesKeys as (boolean | undefined), fileRule.zombieKeys?.fix, defaultRule.zombieKeys.fix) as boolean,
                },
                keysOnViews: {
                    type: (commandOptions.keysOnViews || fileRule.keysOnViews?.type || defaultRule.keysOnViews.type) as ErrorTypes,
                },
                emptyKeys: {
                    type: (commandOptions.emptyKeys || fileRule.emptyKeys?.type || defaultRule.emptyKeys.type) as ErrorTypes,
                },
                misprintKeys: {
                    type: (commandOptions.misprintKeys || fileRule.misprintKeys?.type || defaultRule.misprintKeys.type) as ErrorTypes,
                    coefficient: pick(commandOptions.misprintCoefficient as (number | undefined), fileRule.misprintKeys?.coefficient, defaultRule.misprintKeys.coefficient) as number,
                    ignored: fileRule.misprintKeys?.ignored || defaultRule.misprintKeys.ignored,
                },
                deepSearch: {
                    type: (commandOptions.deepSearch || fileRule.deepSearch?.type || defaultRule.deepSearch.type) as ToggleRule,
                },
                maxWarning: pick(commandOptions.maxWarning as (number | undefined), fileRule.maxWarning, defaultRule.maxWarning) as number,
                ignoredKeys: fileRule.ignoredKeys || defaultRule.ignoredKeys,
                customRegExpToFindKeys: fileRule.customRegExpToFindKeys || defaultRule.customRegExpToFindKeys,
                namespaceKeys: fileRule.namespaceKeys || defaultRule.namespaceKeys,
                maxKeyDepth: fileRule.maxKeyDepth || defaultRule.maxKeyDepth,
                duplicateKeys: {
                    type: (commandOptions.duplicateKeys || fileRule.duplicateKeys?.type || defaultRule.duplicateKeys?.type) as ErrorTypes,
                },
                missingTranslations: {
                    type: (commandOptions.missingTranslations || fileRule.missingTranslations?.type || defaultRule.missingTranslations?.type) as ErrorTypes,
                    fix: pick(commandOptions.fixMissingKeys as (boolean | undefined), fileRule.missingTranslations?.fix, defaultRule.missingTranslations?.fix) as boolean,
                },
                keyNamingConvention: {
                    type: (commandOptions.keyNamingConvention || fileRule.keyNamingConvention?.type || defaultRule.keyNamingConvention?.type) as ErrorTypes,
                    format: (commandOptions.keyNamingConventionFormat || fileRule.keyNamingConvention?.format || defaultRule.keyNamingConvention?.format) as NamingConvention,
                },
            };

            const projectPath: string = commandOptions.project || fileOptions?.project || defaultOptions.project;
            const languagePath: string = commandOptions.languages || fileOptions?.languages || defaultOptions.languages;
            const optionIgnore: string | undefined = commandOptions.ignore;
            const fetchSettings: IFetch = fileOptions?.fetch || defaultOptions.fetch;
            const frameworkPreset: Libraries = (commandOptions.frameworkPreset || fileOptions?.frameworkPreset || defaultOptions.frameworkPreset) as Libraries;

            const outputFormat: OutputFormat = (commandOptions.format || fileOptions?.format || defaultOptions.format) as OutputFormat;

            if (projectPath && languagePath && !!frameworkPreset) {
                await this.runLint(projectPath, languagePath, frameworkPreset, rule, optionIgnore, rule.maxWarning, fetchSettings, outputFormat);
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

    public async getConfig(configPath: string | undefined): Promise<IFileConfig> {
        if (!configPath) {
            return {};
        }

        const extension: string = path.extname(configPath);

        if (extension === '.json') {
            return parseJsonFile(configPath) as IFileConfig;
        }

        if (extension === '.js') {
            const correctConfigPath: string = PathUtils.resolvePath(configPath);
            const result: { default: IFileConfig } = await import(correctConfigPath) as { default: IFileConfig };
            return result.default;
        }

        return {};
    }

    public parse(): void {
        this.printCurrentVersion();

        this.cliClient.parse(process.argv);
    }

    private validate(options: IValidateOptions): boolean {
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
        format: OutputFormat = OutputFormat.stylish,
    ): Promise<void> {
            const regexpList: string[] | undefined = libraries.get(frameworkPreset);
            const validationModel: TranslateLint = new TranslateLint(project, languages, ignore, ruleConfig, fetchSettings, regexpList);
            const resultCliModel: ResultCliModel = await validationModel.lint(maxWarning);
            const resultModel: ResultModel = resultCliModel.getResultModel();

            const jsonIndent: number = 2;
            if (format === OutputFormat.json) {
                process.stdout.write(JSON.stringify(resultModel.toJson(), null, jsonIndent) + '\n');
            } else {
                resultModel.printResult();
                resultModel.printSummery();
                resultModel.printCoverage();
            }

            process.exitCode = resultCliModel.exitCode();

            if (resultModel.hasError) {
                throw new FatalErrorModel(chalk.red(resultModel.message));
            }
    }

    private printCurrentVersion(): void {
        // tslint:disable-next-line:no-any
        const packageJson: any = parseJsonFile(getPackageJsonPath());
        process.stderr.write(`Current version: ${packageJson.version}\n`);
    }
}

export { Cli };