import 'mocha';
import { assert } from 'chai';
import { fluentVueRegEx } from '../../src/libraries/fluent-vue';
import { extractKeys } from './utils';

describe('RegExp: fluent-vue', () => {
    describe('$t() in template', () => {
        it("should match: {{ $t('message-id') }}", () => {
            assert.includeMembers(extractKeys(`{{ $t('button-save') }}`, fluentVueRegEx), ['button-save']);
        });
        it('should match with attributes: $t("id", { attr })', () => {
            assert.includeMembers(extractKeys(`$t('button-save', { count: 1 })`, fluentVueRegEx), ['button-save']);
        });
        it('should NOT match $t inside another identifier', () => {
            assert.notInclude(extractKeys(`no$t('KEY')`, fluentVueRegEx), 'KEY');
        });
    });

    describe('v-t directive', () => {
        it("should match: v-t=\"'message-id'\"", () => {
            assert.includeMembers(extractKeys(`<p v-t="'button-save'"></p>`, fluentVueRegEx), ['button-save']);
        });
        it('should match: v-t="message-id" (no inner quotes)', () => {
            assert.includeMembers(extractKeys(`<p v-t="button-save"></p>`, fluentVueRegEx), ['button-save']);
        });
    });

    describe('edge cases', () => {
        it('should match kebab-case Fluent message ids', () => {
            assert.includeMembers(extractKeys(`$t('welcome-user-greeting')`, fluentVueRegEx), ['welcome-user-greeting']);
        });
        it('should match SCREAMING_SNAKE keys too', () => {
            assert.includeMembers(extractKeys(`$t('BUTTON_SAVE')`, fluentVueRegEx), ['BUTTON_SAVE']);
        });
        it('should match multiple calls', () => {
            const content = `{{ $t('key-one') }} {{ $t('key-two') }}`;
            const keys    = extractKeys(content, fluentVueRegEx);
            assert.include(keys, 'key-one');
            assert.include(keys, 'key-two');
        });
    });
});