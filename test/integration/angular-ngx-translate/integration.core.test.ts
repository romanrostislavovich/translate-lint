import 'mocha';

import path from 'path';
import { assert, expect } from 'chai';

import {
    config as defaultConfig,
    ErrorFlow,
    ErrorTypes,
    IRulesConfig,
    KeyModelWithLanguages,
    LanguagesModel,
    TranslateLint,
    ResultCliModel,
    ResultErrorModel,
    ToggleRule,
} from '../../../src/core';

import { ngxTranslateRegEx } from '../../../src/libraries/angular-ngx-translate';

import { assertFullModel } from './results/arguments.full';
import { assertAngular17Model } from './results/angular_17.full';
import { assertDefaultModel } from './results/default.full';
import { assertCustomConfig } from './results/custom.config';
import { configValues } from './results/config.values';
import { getAbsolutePath, projectFolder, sortResult } from './utils';

const defaultToolsRegEx: string[] = [...ngxTranslateRegEx];

describe('Core Integration', () => {
    const projectIgnorePath: string = './test/integration/angular-ngx-translate/inputs/views/pipe.keys.html';
    const projectWithMaskPath: string = './test/integration/angular-ngx-translate/inputs/views/*.{html,ts}';
    const projectAngular17Path: string = './test/integration/angular-ngx-translate/inputs/views/angular_17.html';
    const projectAbsentMaskPath: string = './test/integration/angular-ngx-translate/inputs/views/';

    const languagesIgnorePath: string = './test/integration/angular-ngx-translate/inputs/locales/EN-eu.json';
    const languagesWithMaskPath: string = './test/integration/angular-ngx-translate/inputs/locales/EN-*.json';
    const languagesAngular17Path: string = './test/integration/angular-ngx-translate/inputs/locales/angular_17.json';
    const languagesIncorrectFile: string = './test/integration/angular-ngx-translate/inputs/locales/incorrect.json';
    const languagesAbsentMaskPath: string = './test/integration/angular-ngx-translate/inputs/locales';

    const ignorePath: string = '';
    const ignoreAngular17ViewPath: string = projectAngular17Path;
    const ignoreAngular17LanguagesPath: string = languagesAngular17Path;

    describe('Custom RegExp to find keys', () => {
       it('should be find keys',async () => {
           // Arrange
           const errorConfig: IRulesConfig = {
               ...defaultConfig.defaultValues.rule,
               customRegExpToFindKeys: [/marker\("(.*)"\)/gm]
           };

           // Act
           const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, errorConfig, undefined, defaultToolsRegEx);
           const result: ResultCliModel = await model.lint();

           // Assert
           assert.deepEqual(result.errors.find(x => x.value === 'CUSTOM.REGEXP.ONE')?.errorType, ErrorTypes.warning);
       });
    });
    describe('Empty Keys', () => {
        it('should be warning by default', async () => {
            // Arrange
            const hasEmptyKeys: boolean = true;
            const countEmptyKeys: number = 1;
            const errorType: ErrorTypes = ErrorTypes.warning;
            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, undefined, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(errorType, result.getEmptyKeys()[0].errorType);
            assert.deepEqual(hasEmptyKeys, result.hasEmptyKeys());
            assert.deepEqual(countEmptyKeys, result.countEmptyKeys());
        });
        it('should be error', async () => {
            // Arrange
            const hasEmptyKeys: boolean = true;
            const countEmptyKeys: number = 1;
            const errorType: ErrorTypes = ErrorTypes.error;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rule,
                emptyKeys: { type: ErrorTypes.error },
            };
            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, errorConfig, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(errorType, result.getEmptyKeys()[0].errorType);
            assert.deepEqual(hasEmptyKeys, result.hasEmptyKeys());
            assert.deepEqual(countEmptyKeys, result.countEmptyKeys());
        });
    });
    describe('Misprint', () => {
        it('should be disable by default', async () => {
            // Arrange
            const hasMisprint: boolean = false;
            const countMisprint: number = 0;

            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, undefined, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(hasMisprint, result.hasMisprint());
            assert.deepEqual(countMisprint, result.countMisprint());
        });
        it('should be error', async () => {
            // Arrange
            const errorConfig: IRulesConfig = {
                zombieKeys:   { type: ErrorTypes.warning },
                keysOnViews:  { type: ErrorTypes.error },
                emptyKeys:    { type: ErrorTypes.warning },
                misprintKeys: { type: ErrorTypes.error, coefficient: 0.9, ignored: [] },
                deepSearch:   { type: ToggleRule.enable },
                maxWarning: 1,
                ignoredKeys: ["IGNORED.KEY.FLAG"],
                customRegExpToFindKeys: []
            };
            const hasMisprint: boolean = true;
            const countMisprint: number = 1;
            const correctError: ResultErrorModel = new ResultErrorModel(
                'STRING.KEY_FROM_PIPE_VIEW.MISPRINT_IN_ONE_LOCALES',
                    ErrorFlow.misprintKeys, ErrorTypes.error,
                    getAbsolutePath(projectFolder, 'pipe.keys.html'),
                    [
                        'EN-us.json',
                        'EN-eu.json',
                    ],
                    [
                        "STRING.KEY_FROM_PIPE_VIEW.MISPRINT_IN_IN_LOCALES"
                    ]
            );

            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, '', errorConfig, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();
            const clearErrors: ResultErrorModel[] = result.errors.filter((error: ResultErrorModel) => error.errorFlow === ErrorFlow.misprintKeys);

            // Assert
            assert.deepEqual(hasMisprint, result.hasMisprint());
            assert.deepEqual(countMisprint, result.countMisprint());
            assert.deepEqual(correctError, clearErrors.pop());
        });
        it('should be have 2 or more suggestions for one key', async () => {
            // Arrange
            const hasMisprint: boolean = true;
            const countMisprint: number = 2;
            const ignorePath: string = `${languagesIgnorePath}, ${projectIgnorePath}`;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rule,
                misprintKeys: { type: ErrorTypes.warning },
            };
            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(hasMisprint, result.hasMisprint());
            assert.deepEqual(countMisprint, result.countMisprint());
        });
    });
    describe('Warnings', () => {
        it('should be 0 by default', async () => {
            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, undefined, undefined, defaultToolsRegEx);
            const result:  ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(0, result.maxCountWarning);
        });
        it('should be error if warnings more thant 2', async () => {
            // Arrange
            const maxWarnings: number = 5;
            const ifFullOfWarning: boolean = true;
            const errorConfig: IRulesConfig = {
                zombieKeys:   { type: ErrorTypes.warning },
                keysOnViews:  { type: ErrorTypes.warning },
                emptyKeys:    { type: ErrorTypes.warning },
                misprintKeys: { type: ErrorTypes.disable, coefficient: 0.9, ignored: [] },
                deepSearch:   { type: ToggleRule.enable },
                maxWarning: 1,
                ignoredKeys: ["IGNORED.KEY.FLAG"],
                customRegExpToFindKeys: []
            };

            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, '', errorConfig, undefined, defaultToolsRegEx);
            const result:  ResultCliModel = await model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning());
            assert.deepEqual(maxWarnings, result.maxCountWarning);
        });
        it('should be warning if warnings less thant 10', async () => {
            // Arrange
            const maxWarnings: number = 20;
            const ifFullOfWarning: boolean = false;

            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, undefined, undefined, defaultToolsRegEx);
            const result: ResultCliModel =  await model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning());
            assert.deepEqual(maxWarnings, result.maxCountWarning);
        });
    });
    describe('Ignore', () => {
        it('should be relative and absolute and have projects and languages files', async () => {
            // Arrange
            const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
            const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}, ${ignoreAngular17LanguagesPath}, ${ignoreAngular17ViewPath}`;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rule,
                deepSearch:   { type: ToggleRule.enable },
                misprintKeys: { type: ErrorTypes.warning },
            };

            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result.errors);
        });

        it('should be empty or incorrect', async () => {
            // Arrange
            const ignorePath: string = `null, 0, undefined, '',`;

            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, undefined, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(sortResult(assertDefaultModel), sortResult(result.errors));
        });
    });
    describe('Path', () => {
        it('should be relative and absolute', async () => {
            // Arrange
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);

            // Act
            const model: TranslateLint = new TranslateLint(absolutePathProject, languagesWithMaskPath, undefined, undefined, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(sortResult(assertDefaultModel), sortResult(result.errors));
        });

        it('should be absent mask', async () => {
            // Arrange
            const ignorePath: string = `${languagesIgnorePath}, ${projectIgnorePath}, ${languagesIncorrectFile}, ${ignoreAngular17LanguagesPath}, ${ignoreAngular17ViewPath}`;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rule,
                deepSearch:   { type: ToggleRule.enable },
                misprintKeys: { type: ErrorTypes.warning },
            };
            // Act
            const model: TranslateLint = new TranslateLint(projectAbsentMaskPath, languagesAbsentMaskPath, ignorePath, errorConfig, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result.errors);
        });
        it('should be empty and incorrect', async () => {
            // Arrange
            const emptyFolder: string = '';
            const incorrectFolder: string = '../files';

            // Act
            const model: TranslateLint = new TranslateLint(emptyFolder, incorrectFolder);

            // Assert
            let error: unknown;
            try {
                await model.lint();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('Error');
        });

        it('should with parse error', async () => {
            // Arrange
            const absoluteIncorrectLanguagesPath: string = path.resolve(__dirname, process.cwd(), languagesIncorrectFile);
            const errorMessage: string = `Can't parse JSON file: ${absoluteIncorrectLanguagesPath}`;

            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesIncorrectFile);

            // Assert
            let error: unknown;
            try {
                await model.lint();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('Error');
        });
    });

    describe('Config', () => {
        it('should be default', async () => {
            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, undefined, undefined, defaultToolsRegEx);
            const result:  ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(sortResult(assertDefaultModel), sortResult(result.errors));
        });
        it('should be incorrect', async () => {
            // Arrange
            const errorConfig: object = {
                keysOnViews: 'incorrect',
                anotherIncorrectKey: ErrorTypes.disable
            };

            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig as IRulesConfig);

            // Assert
            let error: unknown;
            try {
                await model.lint();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('Error');
        });
        it('should be custom', async () => {
            // Arrange
            const errorConfig: IRulesConfig = {
                zombieKeys:   { type: ErrorTypes.disable },
                keysOnViews:  { type: ErrorTypes.warning },
                emptyKeys:    { type: ErrorTypes.warning },
                misprintKeys: { type: ErrorTypes.disable, coefficient: 0.9, ignored: [] },
                deepSearch:   { type: ToggleRule.enable },
                maxWarning: 1,
                ignoredKeys: ["IGNORED.KEY.FLAG", "STRING.KEY_FROM_ANGULAR_17.EXIST_IN_ALL_LOCALES"],
                customRegExpToFindKeys: []
            };

            // Act
            const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, ignoreAngular17ViewPath, errorConfig, undefined, defaultToolsRegEx);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(sortResult(assertCustomConfig), sortResult(result.errors));
        });
    });
    describe('API', () => {
        describe('getLanguages', () => {
           it('should be correct', () => {
               // Arrange
               const countOfLanguage: number = 2;
               // Act
               const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, undefined, undefined, defaultToolsRegEx);
               const result: LanguagesModel[] = model.getLanguages();

               // Assert
               assert.equal(result.length, countOfLanguage);
           });
        });
        describe('getKeys', () => {
            it('should be correct', () => {
                // Arrange
                 const countOfKeys: number = configValues.totalKeys;
                // Act
                const model: TranslateLint = new TranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, undefined, undefined, defaultToolsRegEx);
                const result: KeyModelWithLanguages[] = model.getKeys();

                // Assert
                assert.equal(result.length, countOfKeys);
            });
        });
    });
    it('Angular 17',  async () => {
        const errorConfig: IRulesConfig = {
            zombieKeys:   { type: ErrorTypes.warning },
            keysOnViews:  { type: ErrorTypes.error },
            emptyKeys:    { type: ErrorTypes.warning },
            misprintKeys: { type: ErrorTypes.warning, coefficient: 0.9, ignored: [] },
            deepSearch:   { type: ToggleRule.enable },
            maxWarning: 1,
            ignoredKeys: ["IGNORED.KEY.FLAG"],
            customRegExpToFindKeys: []
        };
        const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectAngular17Path);
        const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
        const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}`;

        // Act
        const model: TranslateLint = new TranslateLint(absolutePathProject, languagesAngular17Path, ignorePath, errorConfig, undefined, defaultToolsRegEx);
        const result: ResultCliModel = await model.lint();

        // Assert
        assert.deepEqual(assertAngular17Model, result.errors);
    });
    it('with full arguments', async () => {
        // Arrange
        const errorConfig: IRulesConfig = {
            zombieKeys:   { type: ErrorTypes.warning },
            keysOnViews:  { type: ErrorTypes.error },
            emptyKeys:    { type: ErrorTypes.warning },
            misprintKeys: { type: ErrorTypes.warning, coefficient: 0.9, ignored: [] },
            deepSearch:   { type: ToggleRule.enable },
            maxWarning: 1,
            ignoredKeys: ["IGNORED.KEY.FLAG"],
            customRegExpToFindKeys: []
        };
        const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);
        const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
        const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}, ${ignoreAngular17LanguagesPath}, ${ignoreAngular17ViewPath}`;

        // Act
        const model: TranslateLint = new TranslateLint(absolutePathProject, languagesWithMaskPath, ignorePath, errorConfig, undefined, defaultToolsRegEx);
        const result: ResultCliModel = await model.lint();

        // Assert
        assert.deepEqual(assertFullModel, result.errors);
    });
});