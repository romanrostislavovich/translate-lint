import 'mocha';
import { assert } from 'chai';
import { reactI18NextRegEx } from '../../src/libraries/react-i18next';
import { extractKeys } from './utils';

describe('RegExp: react-i18next', () => {
    describe('t() function', () => {
        it("should match: t('KEY')", () => {
            assert.includeMembers(extractKeys(`t('BUTTON.SAVE')`, reactI18NextRegEx), ['BUTTON.SAVE']);
        });
        it('should match: t("KEY")', () => {
            assert.includeMembers(extractKeys(`t("BUTTON.SAVE")`, reactI18NextRegEx), ['BUTTON.SAVE']);
        });
        it('should match t with namespace: t("ns:KEY")', () => {
            assert.includeMembers(extractKeys(`t('common:BUTTON.SAVE')`, reactI18NextRegEx), ['common:BUTTON.SAVE']);
        });
        it('should match t with whitespace: t( "KEY" )', () => {
            assert.includeMembers(extractKeys(`t( 'BUTTON.SAVE' )`, reactI18NextRegEx), ['BUTTON.SAVE']);
        });
        it('should NOT match part of another word like "not()"', () => {
            assert.notInclude(extractKeys(`not('KEY')`, reactI18NextRegEx), 'KEY');
        });
    });

    describe('<Trans> component', () => {
        it('should match: <Trans i18nKey="KEY">', () => {
            assert.includeMembers(extractKeys(`<Trans i18nKey="WELCOME.MESSAGE">text</Trans>`, reactI18NextRegEx), ['WELCOME.MESSAGE']);
        });
        it("should match: <Trans i18nKey={'KEY'}>", () => {
            assert.includeMembers(extractKeys(`<Trans i18nKey={'WELCOME.MESSAGE'}>text</Trans>`, reactI18NextRegEx), ['WELCOME.MESSAGE']);
        });
    });

    describe('edge cases', () => {
        it('should match multiple t() calls', () => {
            const content = `const a = t('KEY.ONE'); const b = t('KEY.TWO');`;
            const keys    = extractKeys(content, reactI18NextRegEx);
            assert.include(keys, 'KEY.ONE');
            assert.include(keys, 'KEY.TWO');
        });
    });
});