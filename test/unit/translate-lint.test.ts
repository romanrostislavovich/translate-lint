import 'mocha';
import { assert } from 'chai';
import {
    TranslateLint,
    ResultCliModel,
    ErrorTypes,
    ErrorFlow,
    ToggleRule,
    IRulesConfig,
    LanguagesModel,
    KeyModelWithLanguages,
} from '../../src/core';
import { INamespaceRule } from '../../src/core/interface/IAppConfig';
import { libraries, Libraries } from '../../src/libraries';

const angularRegEx = libraries.get(Libraries.AngularNgxTranslate)!;

const projectPath   = './test/integration/angular-ngx-translate/inputs/views/*.{html,ts}';
const languagesPath = './test/integration/angular-ngx-translate/inputs/locales/EN-*.json';
const ignorePath    = './test/integration/angular-ngx-translate/inputs/locales/EN-eu.json, ./test/integration/angular-ngx-translate/inputs/views/angular_17.html';

const defaultConfig: IRulesConfig = {
    keysOnViews:            ErrorTypes.error,
    zombieKeys:             ErrorTypes.warning,
    emptyKeys:              ErrorTypes.warning,
    misprintKeys:           ErrorTypes.disable,
    deepSearch:             ToggleRule.disable,
    maxWarning:             0,
    misprintCoefficient:    0.9,
    ignoredKeys:            [],
    ignoredMisprintKeys:    [],
    customRegExpToFindKeys: [],
};

describe('TranslateLint', () => {
    describe('lint()', () => {
        it('should return a ResultCliModel', async () => {
            const client = new TranslateLint(projectPath, languagesPath, ignorePath, defaultConfig, false, undefined, angularRegEx);
            const result = await client.lint();
            assert.instanceOf(result, ResultCliModel);
        });

        it('should detect zombie keys', async () => {
            const client = new TranslateLint(projectPath, languagesPath, ignorePath, defaultConfig, false, undefined, angularRegEx);
            const result = await client.lint();
            const zombies = result.errors.filter(e => e.errorFlow === ErrorFlow.zombieKeys);
            assert.isAbove(zombies.length, 0);
        });

        it('should detect empty keys', async () => {
            const ignoreViews = './test/integration/angular-ngx-translate/inputs/views/angular_17.html';
            const client = new TranslateLint(projectPath, languagesPath, ignoreViews, defaultConfig, false, undefined, angularRegEx);
            const result = await client.lint();
            assert.isTrue(result.hasEmptyKeys());
        });

        it('should respect ignoredKeys', async () => {
            const config = { ...defaultConfig, ignoredKeys: ['IGNORED.KEY.FLAG'] };
            const client = new TranslateLint(projectPath, languagesPath, ignorePath, config, false, undefined, angularRegEx);
            const result = await client.lint();
            const ignored = result.errors.filter(e => e.value === 'IGNORED.KEY.FLAG');
            assert.equal(ignored.length, 0);
        });

        it('should disable zombie rule when set to disable', async () => {
            const config = { ...defaultConfig, zombieKeys: ErrorTypes.disable };
            const client = new TranslateLint(projectPath, languagesPath, ignorePath, config, false, undefined, angularRegEx);
            const result = await client.lint();
            const zombies = result.errors.filter(e => e.errorFlow === ErrorFlow.zombieKeys);
            assert.equal(zombies.length, 0);
        });

        it('should throw when projectPath is empty', async () => {
            const client = new TranslateLint('', languagesPath);
            let error: unknown;
            try { await client.lint(); } catch (e) { error = e; }
            assert.instanceOf(error, Error);
        });

        it('should run namespaceKeys rule when configured', async () => {
            const nsConfig: INamespaceRule = {
                type:             ErrorTypes.warning,
                delimiter:        '.',
                namespaces:       { 'STRING': ['allowed/folder/only'] },
                globalNamespaces: [],
                ignoreInFolders:  [],
            };
            const config = { ...defaultConfig, namespaceKeys: nsConfig };
            const client = new TranslateLint(projectPath, languagesPath, ignorePath, config, false, undefined, angularRegEx);
            const result = await client.lint();
            const nsErrors = result.errors.filter(e => e.errorFlow === ErrorFlow.namespaceKeys);
            assert.isAbove(nsErrors.length, 0);
        });
    });

    describe('getLanguages()', () => {
        it('should return an array of LanguagesModel', () => {
            const client = new TranslateLint(projectPath, languagesPath, ignorePath, defaultConfig, false, undefined, angularRegEx);
            const result = client.getLanguages();
            assert.isArray(result);
            assert.isAbove(result.length, 0);
            assert.instanceOf(result[0], LanguagesModel);
        });
    });

    describe('getKeys()', () => {
        it('should return an array of KeyModelWithLanguages', () => {
            const client = new TranslateLint(projectPath, languagesPath, ignorePath, defaultConfig, false, undefined, angularRegEx);
            const result = client.getKeys();
            assert.isArray(result);
            assert.isAbove(result.length, 0);
        });
    });
});
