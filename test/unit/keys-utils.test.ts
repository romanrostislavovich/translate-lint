import 'mocha';
import { assert } from 'chai';
import { KeysUtils } from '../../src/core/utils/keys';
import { KeyModel } from '../../src/core/models';
import { ToggleRule } from '../../src/core/enums';

describe('KeysUtils', () => {
    describe('groupKeysByName', () => {
        it('should merge keys with the same name', () => {
            const keys = [
                new KeyModel('MY.KEY', ['view1.html'], ['en.json']),
                new KeyModel('MY.KEY', ['view2.html'], ['fr.json']),
            ];

            const result = KeysUtils.groupKeysByName(keys);

            assert.equal(result.length, 1);
            assert.equal(result[0].name, 'MY.KEY');
            assert.includeMembers(result[0].views, ['view1.html', 'view2.html']);
            assert.includeMembers(result[0].languages, ['en.json', 'fr.json']);
        });

        it('should not merge keys with different names', () => {
            const keys = [
                new KeyModel('KEY.ONE', ['view.html'], ['en.json']),
                new KeyModel('KEY.TWO', ['view.html'], ['en.json']),
            ];

            const result = KeysUtils.groupKeysByName(keys);

            assert.equal(result.length, 2);
        });

        it('should deduplicate views and languages within a key', () => {
            const keys = [
                new KeyModel('MY.KEY', ['view.html'], ['en.json']),
                new KeyModel('MY.KEY', ['view.html'], ['en.json']),
            ];

            const result = KeysUtils.groupKeysByName(keys);

            assert.equal(result[0].views.length, 1);
            assert.equal(result[0].languages.length, 1);
        });

        it('should return empty array for empty input', () => {
            assert.deepEqual(KeysUtils.groupKeysByName([]), []);
        });
    });

    describe('findKeysList', () => {
        it('should return a RegExp', () => {
            const regexp = KeysUtils.findKeysList(['KEY.ONE', 'KEY.TWO'], [], ToggleRule.disable, ['(?<=t\\()([^)]+)(?=\\))']);
            assert.instanceOf(regexp, RegExp);
        });

        it('should include toolsRegEx patterns', () => {
            const pattern = `(?<=marker\\()([A-Z.]+)(?=\\))`;
            const regexp  = KeysUtils.findKeysList([], [], ToggleRule.disable, [pattern]);
            assert.include(regexp.source, 'marker');
        });

        it('should include custom RegExp patterns', () => {
            const custom = `(?<=myFunc\\()([A-Z.]+)(?=\\))`;
            const regexp = KeysUtils.findKeysList([], [custom], ToggleRule.disable, []);
            assert.include(regexp.source, 'myFunc');
        });

        it('deepSearch=enable should build key-specific regexp', () => {
            const regexp = KeysUtils.findKeysList(['MY.KEY'], [], ToggleRule.enable, []);
            assert.include(regexp.source, 'MY\\.KEY');
        });

        it('deepSearch=disable should not include key-specific patterns', () => {
            const regexp = KeysUtils.findKeysList(['MY.KEY'], [], ToggleRule.disable, []);
            assert.notInclude(regexp.source, 'MY\\.KEY');
        });
    });
});