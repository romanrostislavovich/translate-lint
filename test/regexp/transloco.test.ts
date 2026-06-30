import 'mocha';
import { assert } from 'chai';
import { translocoRegEx } from '../../src/libraries/transloco';
import { extractKeys } from './utils';

describe('RegExp: transloco', () => {
    describe("'KEY' | transloco pipe", () => {
        it("should match: {{ 'KEY' | transloco }}", () => {
            assert.includeMembers(extractKeys(`{{ 'home.title' | transloco }}`, translocoRegEx), ['home.title']);
        });

        it('should match: "KEY" | transloco (double quotes)', () => {
            assert.includeMembers(extractKeys(`{{ "nav.login" | transloco }}`, translocoRegEx), ['nav.login']);
        });

        it("should match pipe with params: 'KEY' | transloco:{ name: x }", () => {
            assert.includeMembers(extractKeys(`{{ 'greeting.hello' | transloco:{ name: userName } }}`, translocoRegEx), ['greeting.hello']);
        });

        it('should match inside attribute binding: [title]="\'KEY\' | transloco"', () => {
            assert.includeMembers(extractKeys(`<button [title]="'a11y.close' | transloco">X</button>`, translocoRegEx), ['a11y.close']);
        });

        it('should match hyphenated keys', () => {
            assert.includeMembers(extractKeys(`{{ 'button-save' | transloco }}`, translocoRegEx), ['button-save']);
        });

        it('should NOT match when "transloco" is a prefix of another pipe name', () => {
            const keys = extractKeys(`{{ 'KEY' | translocoSomethingElse }}`, translocoRegEx);
            assert.notInclude(keys, 'KEY');
        });

        it('should match multiple keys in one template', () => {
            const content = `{{ 'home.title' | transloco }} {{ 'home.subtitle' | transloco }}`;
            const keys = extractKeys(content, translocoRegEx);
            assert.include(keys, 'home.title');
            assert.include(keys, 'home.subtitle');
        });
    });

    describe('Service: translocoService.translate()', () => {
        it("should match: translocoService.translate('KEY')", () => {
            assert.includeMembers(extractKeys(`this.translocoService.translate('auth.login')`, translocoRegEx), ['auth.login']);
        });

        it("should match: translocoService.selectTranslate('KEY')", () => {
            assert.includeMembers(extractKeys(`this.translocoService.selectTranslate('user.profile')`, translocoRegEx), ['user.profile']);
        });

        it('should match with template literals', () => {
            assert.includeMembers(extractKeys('this.translocoService.translate(`errors.notFound`)', translocoRegEx), ['errors.notFound']);
        });

        it('should match aliased service: myService.translate()', () => {
            assert.includeMembers(extractKeys(`this.i18n.translate('nav.home')`, translocoRegEx), ['nav.home']);
        });
    });

    describe('t() inside *transloco="let t" directive', () => {
        it("should match: {{ t('KEY') }}", () => {
            assert.includeMembers(extractKeys(`{{ t('dashboard.title') }}`, translocoRegEx), ['dashboard.title']);
        });

        it("should match: t('KEY') with params", () => {
            assert.includeMembers(extractKeys(`{{ t('greeting', { name: user.name }) }}`, translocoRegEx), ['greeting']);
        });

        it('should NOT match when t is part of another word', () => {
            assert.notInclude(extractKeys(`not('KEY')`, translocoRegEx), 'KEY');
        });

        it('should NOT match standalone word like "emit(\'event\')"', () => {
            assert.notInclude(extractKeys(`this.emit('click')`, translocoRegEx), 'click');
        });
    });

    describe('edge cases', () => {
        it('should match deeply nested key paths', () => {
            assert.includeMembers(extractKeys(`{{ 'a.b.c.d' | transloco }}`, translocoRegEx), ['a.b.c.d']);
        });

        it('should match key with numbers', () => {
            assert.includeMembers(extractKeys(`{{ 'error.404' | transloco }}`, translocoRegEx), ['error.404']);
        });
    });
});