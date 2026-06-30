import 'mocha';
import { assert } from 'chai';
import { nuxtI18nRegEx } from '../../src/libraries/nuxtjs-i18n';
import { extractKeys } from './utils';

describe('RegExp: @nuxtjs/i18n', () => {
    describe('$t() in Vue template', () => {
        it("should match: {{ $t('KEY') }}", () => {
            assert.includeMembers(extractKeys(`{{ $t('page.title') }}`, nuxtI18nRegEx), ['page.title']);
        });

        it("should match: {{ $tc('KEY', n) }}", () => {
            assert.includeMembers(extractKeys(`{{ $tc('items.count', itemCount) }}`, nuxtI18nRegEx), ['items.count']);
        });

        it("should match: {{ $te('KEY') }}", () => {
            assert.includeMembers(extractKeys(`{{ $te('feature.enabled') }}`, nuxtI18nRegEx), ['feature.enabled']);
        });

        it('should match in attribute: :placeholder="$t(\'KEY\')"', () => {
            assert.includeMembers(extractKeys(`:placeholder="$t('form.email')"`, nuxtI18nRegEx), ['form.email']);
        });
    });

    describe('t() from useI18n() Composition API', () => {
        it("should match: t('KEY') from const { t } = useI18n()", () => {
            assert.includeMembers(extractKeys(`const label = t('nav.home')`, nuxtI18nRegEx), ['nav.home']);
        });

        it("should match: i18n.t('KEY') via const i18n = useI18n()", () => {
            assert.includeMembers(extractKeys(`const text = i18n.t('error.notFound')`, nuxtI18nRegEx), ['error.notFound']);
        });

        it("should match: $i18n.t('KEY') via useNuxtApp()", () => {
            assert.includeMembers(extractKeys(`const msg = app.$i18n.t('toast.success')`, nuxtI18nRegEx), ['toast.success']);
        });

        it('should NOT match when t is part of another word', () => {
            assert.notInclude(extractKeys(`not('KEY')`, nuxtI18nRegEx), 'KEY');
        });
    });

    describe('v-t directive', () => {
        it("should match: v-t=\"'KEY'\"", () => {
            assert.includeMembers(extractKeys(`<span v-t="'nav.about'"></span>`, nuxtI18nRegEx), ['nav.about']);
        });

        it('should match: v-t="KEY" (no inner quotes)', () => {
            assert.includeMembers(extractKeys(`<p v-t="welcome.message"></p>`, nuxtI18nRegEx), ['welcome.message']);
        });
    });

    describe('<i18n-t> component (Nuxt 3 / vue-i18n v9)', () => {
        it('should match: <i18n-t keypath="KEY">', () => {
            assert.includeMembers(extractKeys(`<i18n-t keypath="banner.message" />`, nuxtI18nRegEx), ['banner.message']);
        });

        it('should match with other attributes before keypath', () => {
            assert.includeMembers(extractKeys(`<i18n-t tag="p" keypath="terms.text">`, nuxtI18nRegEx), ['terms.text']);
        });
    });

    describe('edge cases', () => {
        it('should match multiple keys in one file', () => {
            const content = `{{ $t('page.title') }} {{ $t('page.subtitle') }}`;
            const keys = extractKeys(content, nuxtI18nRegEx);
            assert.include(keys, 'page.title');
            assert.include(keys, 'page.subtitle');
        });

        it('should match keys with hyphens', () => {
            assert.includeMembers(extractKeys(`$t('button-save')`, nuxtI18nRegEx), ['button-save']);
        });

        it('should match deeply nested keys', () => {
            assert.includeMembers(extractKeys(`t('auth.form.password.label')`, nuxtI18nRegEx), ['auth.form.password.label']);
        });
    });
});