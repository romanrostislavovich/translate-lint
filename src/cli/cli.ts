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
    $ ${name} -p '${config.defaultValues.project}' -z ${ErrorTypes.disable} -v ${ErrorTypes.error} -f react-i18next
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
            // Options
            const fileOptions: any = await this.getConfig(this.cliClient.opts().config);
            const commandOptions: any = this.cliClient.opts();
            const defaultOptions: any = config.defaultValues;

            const resultOptions: any = {
                ...defaultOptions,
                ...defaultOptions?.rules,

                ...commandOptions,

                ...fileOptions,
                ...fileOptions?.rules,
            };

            const projectPath: string = resultOptions.project;
            const languagePath: string = resultOptions.languages;
            const fixZombiesKeys: boolean = resultOptions.fixZombiesKeys;
            const deepSearch: ToggleRule = resultOptions.deepSearch;
            const optionIgnore: string = resultOptions.ignore;
            const optionMisprint: ErrorTypes = resultOptions.misprintKeys;
            const optionEmptyKey: ErrorTypes = resultOptions.emptyKeys;
            const optionViewsRule: ErrorTypes = resultOptions.keysOnViews;
            const optionMaxWarning: number = resultOptions.maxWarning;
            const optionZombiesRule: ErrorTypes = resultOptions.zombieKeys;
            const optionIgnoredKeys: string[] = resultOptions.ignoredKeys;
            const optionMisprintCoefficient: number = resultOptions.misprintCoefficient;
            const optionIgnoredMisprintKeys: string[] = resultOptions.ignoredMisprintKeys;
            const optionCustomRegExpToFindKeys: string[] | RegExp[] = resultOptions.customRegExpToFindKeys;
            const fetchSettings: IFetch = resultOptions.fetch;
            const frameworkPreset: Libraries = resultOptions.frameworkPreset;

            if (projectPath && languagePath && !!frameworkPreset) {
                await this.runLint(
                    projectPath, languagePath, frameworkPreset, optionZombiesRule,
                    optionViewsRule, optionIgnore, optionMaxWarning, optionMisprint, optionEmptyKey, deepSearch,
                    optionMisprintCoefficient, optionIgnoredKeys, optionIgnoredMisprintKeys, optionCustomRegExpToFindKeys, fixZombiesKeys, fetchSettings
                );
            } else {
                const cliHasError: boolean = this.validate(resultOptions);
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

    public  async runLint(
        project: string,
        languages: string,
        frameworkPreset: Libraries,
        zombies?: ErrorTypes,
        views?: ErrorTypes,
        ignore?: string,
        maxWarning: number = 1,
        misprint?: ErrorTypes,
        emptyKeys?: ErrorTypes,
        deepSearch?: ToggleRule,
        misprintCoefficient: number = 0.9,
        ignoredKeys: string[] = [],
        ignoredMisprintKeys: string[] = [],
        customRegExpToFindKeys: string[] | RegExp[] = [],
        fixZombiesKeys?: boolean,
        fetchSettings?: IFetch,
    ): Promise<void> {
            const errorConfig: IRulesConfig = {
                misprintKeys: misprint || ErrorTypes.disable,
                deepSearch: deepSearch || ToggleRule.disable,
                zombieKeys: zombies || ErrorTypes.warning,
                emptyKeys: emptyKeys || ErrorTypes.warning,
                keysOnViews: views || ErrorTypes.error,
                maxWarning,
                ignoredKeys,
                ignoredMisprintKeys,
                misprintCoefficient,
                customRegExpToFindKeys,
            };

            const regexpList: string[] | undefined = libraries.get(frameworkPreset);
            const validationModel: TranslateLint = new TranslateLint(project, languages, ignore, errorConfig, fixZombiesKeys, fetchSettings, regexpList);
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
