import 'mocha';
import { assert } from 'chai';
import * as path from 'path';
import { DuplicateKeysRule, findDuplicatesInContent } from '../../src/core/rules/DuplicateKeysRule';
import { ErrorTypes, ErrorFlow } from '../../src/core/enums';

const fixturesDir = path.resolve(__dirname, 'fixtures', 'duplicates');
const duplicateJsonFile  = path.join(fixturesDir, 'duplicate-keys.json');
const noDuplicateFile    = path.join(fixturesDir, 'no-duplicates.json');
const duplicateYamlFile  = path.join(fixturesDir, 'duplicate-keys.yaml');

describe('DuplicateKeysRule', () => {
    describe('findDuplicatesInContent()', () => {
        it('should detect a flat duplicate JSON key', () => {
            const content = '{\n  "key": "v1",\n  "key": "v2"\n}';
            const result = findDuplicatesInContent(content);
            assert.equal(result.length, 1);
            assert.equal(result[0].key, 'key');
            assert.equal(result[0].line, 3);
        });

        it('should detect a duplicate nested key at the same level', () => {
            const content = '{\n  "a": {\n    "x": 1\n  },\n  "a": {\n    "y": 2\n  }\n}';
            const result = findDuplicatesInContent(content);
            assert.equal(result.length, 1);
            assert.equal(result[0].key, 'a');
        });

        it('should not flag same key name at different nesting levels', () => {
            const content = '{\n  "user": {\n    "name": "John"\n  },\n  "admin": {\n    "name": "Jane"\n  }\n}';
            const result = findDuplicatesInContent(content);
            assert.equal(result.length, 0);
        });

        it('should not flag unique keys', () => {
            const content = '{\n  "KEY.ONE": "v1",\n  "KEY.TWO": "v2"\n}';
            const result = findDuplicatesInContent(content);
            assert.equal(result.length, 0);
        });

        it('should detect multiple duplicates in one file', () => {
            const content = '{\n  "a": 1,\n  "b": 2,\n  "a": 3,\n  "b": 4\n}';
            const result = findDuplicatesInContent(content);
            assert.equal(result.length, 2);
            assert.deepEqual(result.map(r => r.key), ['a', 'b']);
        });

        it('should detect YAML flat key duplicates', () => {
            const content = 'KEY.SAVE: Save\nKEY.TITLE: Title\nKEY.SAVE: Duplicate\n';
            const result = findDuplicatesInContent(content);
            assert.equal(result.length, 1);
            assert.equal(result[0].key, 'KEY.SAVE');
            assert.equal(result[0].line, 3);
        });
    });

    describe('check()', () => {
        it('should report errors for duplicate keys in a JSON file', () => {
            const rule = new DuplicateKeysRule(ErrorTypes.error, [duplicateJsonFile]);
            const result = rule.check([], []);
            assert.isAbove(result.length, 0);
            assert.isTrue(result.every(r => r.errorFlow === ErrorFlow.duplicateKeys));
        });

        it('should report the correct file path', () => {
            const rule = new DuplicateKeysRule(ErrorTypes.error, [duplicateJsonFile]);
            const result = rule.check([], []);
            assert.isTrue(result.every(r => r.currentPath === duplicateJsonFile));
        });

        it('should include the line number in absentedPath', () => {
            const rule = new DuplicateKeysRule(ErrorTypes.error, [duplicateJsonFile]);
            const result = rule.check([], []);
            assert.isTrue(result.every(r => !isNaN(Number(r.absentedPath))));
        });

        it('should use the configured error type', () => {
            const rule = new DuplicateKeysRule(ErrorTypes.warning, [duplicateJsonFile]);
            const result = rule.check([], []);
            assert.isTrue(result.every(r => r.errorType === ErrorTypes.warning));
        });

        it('should return no errors for a file without duplicates', () => {
            const rule = new DuplicateKeysRule(ErrorTypes.error, [noDuplicateFile]);
            const result = rule.check([], []);
            assert.equal(result.length, 0);
        });

        it('should detect duplicates in YAML files', () => {
            const rule = new DuplicateKeysRule(ErrorTypes.error, [duplicateYamlFile]);
            const result = rule.check([], []);
            assert.isAbove(result.length, 0);
            assert.equal(result[0].value, 'BUTTON.SAVE');
        });

        it('should return empty array when no files are provided', () => {
            const rule = new DuplicateKeysRule(ErrorTypes.error, []);
            assert.equal(rule.check([], []).length, 0);
        });

        it('should produce correct message via ResultErrorModel.message()', () => {
            const rule = new DuplicateKeysRule(ErrorTypes.error, [duplicateJsonFile]);
            const result = rule.check([], []);
            const msg = result[0].message() as string;
            assert.include(msg, result[0].value);
            assert.include(msg, 'duplicated');
            assert.include(msg, duplicateJsonFile);
        });

        it('should have correct flow identifier', () => {
            assert.equal(new DuplicateKeysRule(ErrorTypes.error).flow, ErrorFlow.duplicateKeys);
        });

        it('should skip non-language files gracefully', () => {
            const rule = new DuplicateKeysRule(ErrorTypes.error, [__filename]);
            assert.doesNotThrow(() => rule.check([], []));
            assert.equal(rule.check([], []).length, 0);
        });
    });
});