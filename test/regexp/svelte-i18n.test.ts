import 'mocha';
import { assert } from 'chai';
import { svelteI18nRegEx } from '../../src/libraries/svelte-i18n';
import { extractKeys } from './utils';

describe('RegExp: svelte-i18n', () => {
    describe('$_() — main store (auto-subscribe in .svelte)', () => {
        it("should match: {$_('KEY')}", () => {
            assert.includeMembers(extractKeys(`<h1>{$_('page.title')}</h1>`, svelteI18nRegEx), ['page.title']);
        });

        it('should match with interpolation params', () => {
            assert.includeMembers(extractKeys(`{$_('greeting', { values: { name } })}`, svelteI18nRegEx), ['greeting']);
        });

        it('should match with default option', () => {
            assert.includeMembers(extractKeys(`{$_('optional.key', { default: 'Fallback' })}`, svelteI18nRegEx), ['optional.key']);
        });

        it('should match in svelte:head', () => {
            assert.includeMembers(extractKeys(`<title>{$_('site.title')}</title>`, svelteI18nRegEx), ['site.title']);
        });

        it('should match multiple keys in one template', () => {
            const content = `{$_('nav.home')} {$_('nav.about')}`;
            const keys = extractKeys(content, svelteI18nRegEx);
            assert.include(keys, 'nav.home');
            assert.include(keys, 'nav.about');
        });
    });

    describe('$format() — explicit format store', () => {
        it("should match: {$format('KEY')}", () => {
            assert.includeMembers(extractKeys(`{$format('sign_in')}`, svelteI18nRegEx), ['sign_in']);
        });

        it('should match with params', () => {
            assert.includeMembers(extractKeys(`{$format('greeting', { values: { name: 'Alice' } })}`, svelteI18nRegEx), ['greeting']);
        });
    });

    describe('$t() — built-in t alias', () => {
        it("should match: {$t('KEY')}", () => {
            assert.includeMembers(extractKeys(`{$t('nav.home')}`, svelteI18nRegEx), ['nav.home']);
        });

        it('should NOT match $toast or $trigger (different $ functions)', () => {
            const keys = extractKeys(`{$toast('KEY')}`, svelteI18nRegEx);
            assert.notInclude(keys, 'KEY');
        });
    });

    describe('get(_)() — non-reactive usage in .ts/.js / SvelteKit load()', () => {
        it("should match: get(_)('KEY')", () => {
            assert.includeMembers(extractKeys(`const msg = get(_)('error.notFound')`, svelteI18nRegEx), ['error.notFound']);
        });

        it("should match: get(format)('KEY')", () => {
            assert.includeMembers(extractKeys(`const title = get(format)('page.title')`, svelteI18nRegEx), ['page.title']);
        });

        it("should match: get(t)('KEY')", () => {
            assert.includeMembers(extractKeys(`const label = get(t)('button.save')`, svelteI18nRegEx), ['button.save']);
        });

        it('should match with double quotes', () => {
            assert.includeMembers(extractKeys(`get(_)("errors.server")`, svelteI18nRegEx), ['errors.server']);
        });
    });

    describe('$json() — subtree key reference', () => {
        it("should match: $json('KEY')", () => {
            assert.includeMembers(extractKeys(`{#each $json('nav.items') as item}`, svelteI18nRegEx), ['nav.items']);
        });
    });

    describe('edge cases', () => {
        it('should match keys with underscores', () => {
            assert.includeMembers(extractKeys(`{$_('button_save')}`, svelteI18nRegEx), ['button_save']);
        });

        it('should match deeply nested keys', () => {
            assert.includeMembers(extractKeys(`{$_('auth.form.email.placeholder')}`, svelteI18nRegEx), ['auth.form.email.placeholder']);
        });

        it('should match keys with hyphens', () => {
            assert.includeMembers(extractKeys(`{$_('button-save')}`, svelteI18nRegEx), ['button-save']);
        });

        it('should match with template literals', () => {
            assert.includeMembers(extractKeys('get(_)(`errors.server`)', svelteI18nRegEx), ['errors.server']);
        });
    });
});