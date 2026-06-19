import 'mocha';
import { assert } from 'chai';
import { nextIntlRegEx } from '../../src/libraries/next-intl';
import { extractKeys } from './utils';

describe('RegExp: next-intl', () => {
    describe('t() function', () => {
        it("should match: t('KEY')", () => {
            assert.includeMembers(extractKeys(`t('BUTTON.SAVE')`, nextIntlRegEx), ['BUTTON.SAVE']);
        });
        it('should match: t("KEY")', () => {
            assert.includeMembers(extractKeys(`t("BUTTON.SAVE")`, nextIntlRegEx), ['BUTTON.SAVE']);
        });
        it('should match: t.rich("KEY")', () => {
            assert.includeMembers(extractKeys(`t.rich('RICH.KEY')`, nextIntlRegEx), ['RICH.KEY']);
        });
        it('should match: t.raw("KEY")', () => {
            assert.includeMembers(extractKeys(`t.raw('RAW.KEY')`, nextIntlRegEx), ['RAW.KEY']);
        });
        it('should match: t.html("KEY")', () => {
            assert.includeMembers(extractKeys(`t.html('HTML.KEY')`, nextIntlRegEx), ['HTML.KEY']);
        });
        it('should NOT match part of another identifier like getT()', () => {
            assert.notInclude(extractKeys(`getT('KEY')`, nextIntlRegEx), 'KEY');
        });
    });

    describe('edge cases', () => {
        it('should match nested key path', () => {
            assert.includeMembers(extractKeys(`t('errors.validation.required')`, nextIntlRegEx), ['errors.validation.required']);
        });
        it('should match multiple t() calls', () => {
            const content = `const a = t('KEY.ONE'); const b = t('KEY.TWO');`;
            const keys    = extractKeys(content, nextIntlRegEx);
            assert.include(keys, 'KEY.ONE');
            assert.include(keys, 'KEY.TWO');
        });
    });
});