import 'mocha';
import { assert } from 'chai';
import { i18nextVueRegEx } from '../../src/libraries/i18next-vue';
import { extractKeys } from './utils';

describe('RegExp: i18next-vue', () => {
    describe('$t() in template', () => {
        it("should match: {{ $t('KEY') }}", () => {
            assert.includeMembers(extractKeys(`{{ $t('BUTTON.SAVE') }}`, i18nextVueRegEx), ['BUTTON.SAVE']);
        });
        it('should match with namespace: $t("ns:KEY")', () => {
            assert.includeMembers(extractKeys(`$t('common:BUTTON.SAVE')`, i18nextVueRegEx), ['common:BUTTON.SAVE']);
        });
    });

    describe('t() in Composition API (useTranslation)', () => {
        it("should match: t('KEY')", () => {
            assert.includeMembers(extractKeys(`const label = t('BUTTON.SAVE')`, i18nextVueRegEx), ['BUTTON.SAVE']);
        });
        it('should NOT match part of another word', () => {
            assert.notInclude(extractKeys(`not('KEY')`, i18nextVueRegEx), 'KEY');
        });
    });

    describe('<i18next> component', () => {
        it('should match: <i18next path="KEY">', () => {
            assert.includeMembers(extractKeys(`<i18next path="WELCOME.TITLE" />`, i18nextVueRegEx), ['WELCOME.TITLE']);
        });
        it('should match with other attributes before path', () => {
            assert.includeMembers(extractKeys(`<i18next tag="span" path="BUTTON.SAVE" />`, i18nextVueRegEx), ['BUTTON.SAVE']);
        });
    });

    describe('edge cases', () => {
        it('should match multiple t() calls', () => {
            const content = `t('KEY.ONE') + t('KEY.TWO')`;
            const keys    = extractKeys(content, i18nextVueRegEx);
            assert.include(keys, 'KEY.ONE');
            assert.include(keys, 'KEY.TWO');
        });
    });
});