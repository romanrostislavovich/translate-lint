import 'mocha';
import { assert } from 'chai';
import { nextI18nextRegEx } from '../../src/libraries/next-i18next';
import { extractKeys } from './utils';

describe('RegExp: next-i18next', () => {
    describe('t() from useTranslation() hook', () => {
        it("should match: t('KEY')", () => {
            assert.includeMembers(extractKeys(`return <h1>{t('hero.title')}</h1>`, nextI18nextRegEx), ['hero.title']);
        });

        it('should match with double quotes', () => {
            assert.includeMembers(extractKeys(`t("nav.about")`, nextI18nextRegEx), ['nav.about']);
        });

        it('should match with template literals', () => {
            assert.includeMembers(extractKeys('t(`errors.notFound`)', nextI18nextRegEx), ['errors.notFound']);
        });

        it("should match: t('ns:KEY') namespace-prefixed key", () => {
            assert.includeMembers(extractKeys(`t('common:hero.title')`, nextI18nextRegEx), ['common:hero.title']);
        });

        it('should match with interpolation options: t("KEY", { name })', () => {
            assert.includeMembers(extractKeys(`t('greeting', { name: user.name })`, nextI18nextRegEx), ['greeting']);
        });

        it('should match via withTranslation HOC: this.props.t("KEY")', () => {
            assert.includeMembers(extractKeys(`this.props.t('auth.login')`, nextI18nextRegEx), ['auth.login']);
        });

        it('should NOT match when t is part of another word', () => {
            assert.notInclude(extractKeys(`not('KEY')`, nextI18nextRegEx), 'KEY');
        });

        it('should match multiple keys in JSX', () => {
            const content = `
                <h1>{t('page.title')}</h1>
                <p>{t('page.description')}</p>
            `;
            const keys = extractKeys(content, nextI18nextRegEx);
            assert.include(keys, 'page.title');
            assert.include(keys, 'page.description');
        });
    });

    describe('<Trans> component', () => {
        it('should match: <Trans i18nKey="KEY">', () => {
            assert.includeMembers(extractKeys(`<Trans i18nKey="auth.terms">...</Trans>`, nextI18nextRegEx), ['auth.terms']);
        });

        it('should match: <Trans i18nKey={"KEY"}>', () => {
            assert.includeMembers(extractKeys(`<Trans i18nKey={"privacy.policy"} />`, nextI18nextRegEx), ['privacy.policy']);
        });

        it('should match Trans with other props before i18nKey', () => {
            assert.includeMembers(extractKeys(`<Trans ns="common" i18nKey="hero.cta">...</Trans>`, nextI18nextRegEx), ['hero.cta']);
        });

        it('should match Trans with single quotes', () => {
            assert.includeMembers(extractKeys(`<Trans i18nKey='footer.copyright'/>`, nextI18nextRegEx), ['footer.copyright']);
        });
    });

    describe('edge cases', () => {
        it('should match keys with underscores', () => {
            assert.includeMembers(extractKeys(`t('button_save')`, nextI18nextRegEx), ['button_save']);
        });

        it('should match deeply nested keys', () => {
            assert.includeMembers(extractKeys(`t('auth.form.email.placeholder')`, nextI18nextRegEx), ['auth.form.email.placeholder']);
        });

        it('should match keys with hyphens', () => {
            assert.includeMembers(extractKeys(`t('hero-title')`, nextI18nextRegEx), ['hero-title']);
        });
    });
});