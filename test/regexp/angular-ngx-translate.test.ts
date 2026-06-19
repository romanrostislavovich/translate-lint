import 'mocha';
import { assert } from 'chai';
import { ngxTranslateRegEx } from '../../src/libraries/angular-ngx-translate';
import { extractKeys } from './utils';

describe('RegExp: angular-ngx-translate', () => {
    describe('pipe in template', () => {
        it("should match: {{ 'KEY.NAME' | translate }}", () => {
            assert.includeMembers(extractKeys(`{{ 'BUTTON.SAVE' | translate }}`, ngxTranslateRegEx), ['BUTTON.SAVE']);
        });
        it('should match: "KEY" | translate', () => {
            assert.includeMembers(extractKeys(`"BUTTON.CANCEL" | translate`, ngxTranslateRegEx), ['BUTTON.CANCEL']);
        });
        it('should match pipe with extra filters before translate', () => {
            assert.includeMembers(extractKeys(`'KEY.ONE' | uppercase | translate`, ngxTranslateRegEx), ['KEY.ONE']);
        });
        it('should NOT match a plain string without the translate pipe', () => {
            assert.notInclude(extractKeys(`'BUTTON.SAVE'`, ngxTranslateRegEx), 'BUTTON.SAVE');
        });
    });

    describe('translate directive on attribute', () => {
        it('should match: [translate]="\'KEY\'"', () => {
            assert.includeMembers(extractKeys(`<span [translate]="'HEADER.TITLE'"></span>`, ngxTranslateRegEx), ['HEADER.TITLE']);
        });
        it('should match: translate="KEY"', () => {
            assert.includeMembers(extractKeys(`<span translate="HEADER.TITLE"></span>`, ngxTranslateRegEx), ['HEADER.TITLE']);
        });
    });

    describe('translate directive inside tag', () => {
        it('should match key as tag content with translate attribute', () => {
            assert.includeMembers(extractKeys(`<span translate>BUTTON.SAVE</span>`, ngxTranslateRegEx), ['BUTTON.SAVE']);
        });
    });

    describe('edge cases', () => {
        it('should match keys with dashes and underscores', () => {
            assert.includeMembers(extractKeys(`'KEY_WITH-DASH.NESTED' | translate`, ngxTranslateRegEx), ['KEY_WITH-DASH.NESTED']);
        });
        it('should match multiple keys in one template', () => {
            const content = `{{ 'KEY.ONE' | translate }} {{ 'KEY.TWO' | translate }}`;
            const keys    = extractKeys(content, ngxTranslateRegEx);
            assert.include(keys, 'KEY.ONE');
            assert.include(keys, 'KEY.TWO');
        });
    });
});