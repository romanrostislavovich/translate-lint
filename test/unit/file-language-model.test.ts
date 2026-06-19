import 'mocha';
import { assert } from 'chai';
import { FileLanguageModel } from '../../src/core/models/files/FileLanguageModel';

describe('FileLanguageModel', () => {
    describe('getKeys() — returns flat key names only', () => {
        it('should return key names from a JSON file', () => {
            const model = new FileLanguageModel(
                './test/integration/angular-ngx-translate/inputs/locales/EN-us.json'
            );
            model.getKeys();
            const names = model.keys.map(k => k.name);
            assert.include(names, 'STRING.KEY_FROM_PIPE_VIEW.EXIST_IN_ALL_LOCALES');
        });

        it('should return keys from all matched locale files via glob', () => {
            const model = new FileLanguageModel(
                './test/integration/angular-ngx-translate/inputs/locales/EN-*.json',
                [], [], './test/integration/angular-ngx-translate/inputs/locales/EN-eu.json'
            );
            model.getKeys();
            assert.isAbove(model.keys.length, 0);
        });

        it('should flatten nested keys with dot-joined names', () => {
            const model = new FileLanguageModel(
                './test/integration/angular-ngx-translate/inputs/locales/EN-us.json'
            );
            model.getKeys();
            const names = model.keys.map(k => k.name);
            assert.include(names, 'OBJECT.KEY_FROM_PIPE_VIEW.EXIST_IN_ALL_LOCALES');
        });

        it('should assign file path in languages array for each key', () => {
            const model = new FileLanguageModel(
                './test/integration/angular-ngx-translate/inputs/locales/EN-us.json'
            );
            model.getKeys();
            assert.isAbove(model.keys.length, 0);
            assert.include(model.keys[0].languages[0], 'EN-us.json');
        });

        it('should throw on an invalid JSON file', () => {
            const model = new FileLanguageModel(
                './test/integration/angular-ngx-translate/inputs/locales/incorrect.json'
            );
            assert.throws(() => model.getKeys(), /Can't parse file/);
        });
    });

    describe('getKeys() — URL / pre-loaded string mode', () => {
        it('should parse pre-loaded JSON string when isURL=true', () => {
            const jsonStr = JSON.stringify({ 'HELLO.WORLD': 'Hello', 'BYE.WORLD': 'Bye' });
            const model   = new FileLanguageModel('remote://api', [], [], '', jsonStr, true);
            model.getKeys();
            const names = model.keys.map(k => k.name);
            assert.include(names, 'HELLO.WORLD');
            assert.include(names, 'BYE.WORLD');
        });

        it('should set file path to the model path when isURL=true', () => {
            const model = new FileLanguageModel(
                'remote://api', [], [], '',
                JSON.stringify({ 'KEY.A': 'a' }), true
            );
            model.getKeys();
            assert.include(model.files, 'remote://api');
        });
    });

    describe('getKeysWithValue() — URL / pre-loaded string mode', () => {
        it('should parse values when isURL=true', () => {
            const jsonStr = JSON.stringify({ 'HELLO.WORLD': 'Hello' });
            const model   = new FileLanguageModel('remote://api', [], [], '', jsonStr, true);
            model.getKeysWithValue();
            const key = model.keys.find(k => k.name === 'HELLO.WORLD');
            assert.exists(key);
            assert.equal(key!.value, 'Hello');
        });

        it('should handle empty fileData gracefully when isURL=true', () => {
            const model = new FileLanguageModel('remote://api', [], [], '', undefined, true);
            model.getKeysWithValue();
            assert.equal(model.keys.length, 0);
        });

        it('should throw on invalid file content', () => {
            const model = new FileLanguageModel(
                './test/integration/angular-ngx-translate/inputs/locales/incorrect.json'
            );
            assert.throws(() => model.getKeysWithValue(), /Can't parse file/);
        });
    });
});