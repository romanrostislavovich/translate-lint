import 'mocha';
import { assert } from 'chai';
import { reactIntlRegEx } from '../../src/libraries/react-intl';
import { extractKeys } from './utils';

describe('RegExp: react-intl', () => {
    describe('<FormattedMessage>', () => {
        it('should match: <FormattedMessage id="KEY">', () => {
            assert.includeMembers(extractKeys(`<FormattedMessage id="BUTTON.SAVE" />`, reactIntlRegEx), ['BUTTON.SAVE']);
        });
        it("should match: <FormattedMessage id={'KEY'}>", () => {
            assert.includeMembers(extractKeys(`<FormattedMessage id={'BUTTON.SAVE'} />`, reactIntlRegEx), ['BUTTON.SAVE']);
        });
        it('should match: <FormattedHTMLMessage id="KEY">', () => {
            assert.includeMembers(extractKeys(`<FormattedHTMLMessage id="HEADER.TITLE" />`, reactIntlRegEx), ['HEADER.TITLE']);
        });
    });

    describe('formatMessage()', () => {
        it('should match: formatMessage({ id: "KEY" })', () => {
            assert.includeMembers(extractKeys(`formatMessage({ id: 'BUTTON.SAVE' })`, reactIntlRegEx), ['BUTTON.SAVE']);
        });
        it('should match with double quotes', () => {
            assert.includeMembers(extractKeys(`formatMessage({ id: "BUTTON.SAVE" })`, reactIntlRegEx), ['BUTTON.SAVE']);
        });
        it('should NOT match formatMessage without id property', () => {
            assert.notInclude(extractKeys(`formatMessage({ value: 'KEY' })`, reactIntlRegEx), 'KEY');
        });
    });

    describe('edge cases', () => {
        it('should match id with nested key path', () => {
            assert.includeMembers(extractKeys(`<FormattedMessage id="errors.field.required" />`, reactIntlRegEx), ['errors.field.required']);
        });
    });
});