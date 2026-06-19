import 'mocha';
import { assert } from 'chai';
import { linguiRegEx } from '../../src/libraries/lingui';
import { extractKeys } from './utils';

describe('RegExp: lingui', () => {
    describe('<Trans> component', () => {
        it('should match: <Trans id="KEY">', () => {
            assert.includeMembers(extractKeys(`<Trans id="BUTTON.SAVE">Save</Trans>`, linguiRegEx), ['BUTTON.SAVE']);
        });
        it("should match: <Trans id={'KEY'}>", () => {
            assert.includeMembers(extractKeys(`<Trans id={'BUTTON.SAVE'}>Save</Trans>`, linguiRegEx), ['BUTTON.SAVE']);
        });
    });

    describe('t() and msg() macros', () => {
        it('should match: t({ id: "KEY" })', () => {
            assert.includeMembers(extractKeys(`t({ id: 'BUTTON.SAVE' })`, linguiRegEx), ['BUTTON.SAVE']);
        });
        it('should match: msg({ id: "KEY" })', () => {
            assert.includeMembers(extractKeys(`msg({ id: 'BUTTON.SAVE' })`, linguiRegEx), ['BUTTON.SAVE']);
        });
        it('should NOT match t() without id property', () => {
            assert.notInclude(extractKeys(`t({ value: 'KEY' })`, linguiRegEx), 'KEY');
        });
    });

    describe('edge cases', () => {
        it('should match keys with dots', () => {
            assert.includeMembers(extractKeys(`<Trans id="errors.required" />`, linguiRegEx), ['errors.required']);
        });
    });
});