import 'mocha';
import path from 'path';
import { assert } from 'chai';
import { FileLanguageModel } from '../../src/core/models/files/FileLanguageModel';

const fixturesDir = path.resolve(__dirname, 'fixtures');

describe('YAML parser (FileLanguageModel)', () => {
    it('should parse flat and nested keys from .yaml file', () => {
        const yamlPath = path.join(fixturesDir, 'en.yaml');
        const model    = new FileLanguageModel(yamlPath, [], [], '');
        const result   = model.getKeysWithValue();

        const keyNames = result.keys.map(k => k.name);

        assert.includeMembers(keyNames, [
            'button.save',
            'button.cancel',
            'button.delete',
            'errors.required',
            'errors.invalid',
            'greeting',
        ]);
    });

    it('should capture values for YAML keys', () => {
        const yamlPath = path.join(fixturesDir, 'en.yaml');
        const model    = new FileLanguageModel(yamlPath, [], [], '');
        const result   = model.getKeysWithValue();

        const saveKey = result.keys.find(k => k.name === 'button.save');
        assert.exists(saveKey);
        assert.equal(saveKey!.value, 'Save');
    });

    it('should detect empty key value from YAML', () => {
        const yamlPath = path.join(fixturesDir, 'en.yaml');
        const model    = new FileLanguageModel(yamlPath, [], [], '');
        const result   = model.getKeysWithValue();

        const emptyKey = result.keys.find(k => k.name === 'empty_key');
        assert.exists(emptyKey);
        assert.equal(emptyKey!.value, '');
    });

    it('should register the yaml file path in languages array', () => {
        const yamlPath = path.join(fixturesDir, 'en.yaml');
        const model    = new FileLanguageModel(yamlPath, [], [], '');
        const result   = model.getKeysWithValue();

        const key = result.keys[0];
        assert.isTrue(key.languages.some(l => l.endsWith('en.yaml')));
    });

    it('should parse via glob pattern matching .yaml', () => {
        const globPath = path.join(fixturesDir, '*.yaml');
        const model    = new FileLanguageModel(globPath, [], [], '');
        const result   = model.getKeysWithValue();

        assert.isAbove(result.keys.length, 0);
    });
});