import 'mocha';
import { assert } from 'chai';
import { vueI18nRegEx } from '../../src/libraries/vue-i18n';
import { extractKeys } from './utils';

describe('RegExp: vue-i18n', () => {
    describe('$t() in template', () => {
        it("should match: {{ $t('KEY') }}", () => {
            assert.includeMembers(extractKeys(`{{ $t('BUTTON.SAVE') }}`, vueI18nRegEx), ['BUTTON.SAVE']);
        });
        it("should match: {{ $tc('KEY', n) }}", () => {
            assert.includeMembers(extractKeys(`{{ $tc('ITEM.COUNT', count) }}`, vueI18nRegEx), ['ITEM.COUNT']);
        });
        it("should match: {{ $te('KEY') }}", () => {
            assert.includeMembers(extractKeys(`{{ $te('BUTTON.EXISTS') }}`, vueI18nRegEx), ['BUTTON.EXISTS']);
        });
    });

    describe('t() in Composition API', () => {
        it("should match: t('KEY')", () => {
            assert.includeMembers(extractKeys(`const label = t('BUTTON.SAVE')`, vueI18nRegEx), ['BUTTON.SAVE']);
        });
        it('should NOT match part of another word like "not()"', () => {
            assert.notInclude(extractKeys(`not('KEY')`, vueI18nRegEx), 'KEY');
        });
    });

    describe('v-t directive', () => {
        it("should match: v-t=\"'KEY'\"", () => {
            assert.includeMembers(extractKeys(`<span v-t="'BUTTON.SAVE'"></span>`, vueI18nRegEx), ['BUTTON.SAVE']);
        });
        it('should match: v-t="KEY" (no inner quotes)', () => {
            assert.includeMembers(extractKeys(`<span v-t="BUTTON.SAVE"></span>`, vueI18nRegEx), ['BUTTON.SAVE']);
        });
    });

    describe('<i18n-t> component (v9+)', () => {
        it('should match: <i18n-t keypath="KEY">', () => {
            assert.includeMembers(extractKeys(`<i18n-t keypath="WELCOME.TITLE" />`, vueI18nRegEx), ['WELCOME.TITLE']);
        });
    });

    describe('<i18n> component (v8 legacy)', () => {
        it('should match: <i18n path="KEY">', () => {
            assert.includeMembers(extractKeys(`<i18n path="WELCOME.TITLE" />`, vueI18nRegEx), ['WELCOME.TITLE']);
        });
    });

    describe('edge cases', () => {
        it('should match keys with dashes (fluent-style)', () => {
            assert.includeMembers(extractKeys(`$t('button-save')`, vueI18nRegEx), ['button-save']);
        });
        it('should match multiple keys in one template', () => {
            const content = `{{ $t('KEY.ONE') }} {{ $t('KEY.TWO') }}`;
            const keys    = extractKeys(content, vueI18nRegEx);
            assert.include(keys, 'KEY.ONE');
            assert.include(keys, 'KEY.TWO');
        });
    });
});