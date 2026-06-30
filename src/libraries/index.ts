import {ngxTranslateRegEx} from "./angular-ngx-translate";
import {linguiRegEx} from "./lingui";
import {nextIntlRegEx} from "./next-intl";
import {reactI18NextRegEx} from "./react-i18next";
import {reactIntlRegEx} from "./react-intl";
import {vueI18nRegEx} from "./vue-i18n";
import {i18nextVueRegEx} from "./i18next-vue";
import {fluentVueRegEx} from "./fluent-vue";
import {translocoRegEx} from "./transloco";
import {nextI18nextRegEx} from "./next-i18next";
import {nuxtI18nRegEx} from "./nuxtjs-i18n";
import {svelteI18nRegEx} from "./svelte-i18n";

const enum Libraries {
    AngularNgxTranslate = 'angular-ngx-translate',
    LinguiJs = 'lingui-js',
    NextIntl = 'next-intl',
    ReactI18next = 'react-i18next',
    ReactIntl = 'react-intl',
    VueI18n = 'vue-i18n',
    I18nextVue = 'i18next-vue',
    FluentVue = 'fluent-vue',
    Transloco = 'transloco',
    NextI18next = 'next-i18next',
    NuxtI18n = 'nuxtjs-i18n',
    SvelteI18n = 'svelte-i18n',
}

const libraries:  Map<Libraries, string[]> = new Map<Libraries, string[]>([
    [Libraries.AngularNgxTranslate, [...ngxTranslateRegEx]],
    [Libraries.LinguiJs, [...linguiRegEx]],
    [Libraries.NextIntl, [...nextIntlRegEx]],
    [Libraries.ReactI18next, [...reactI18NextRegEx]],
    [Libraries.ReactIntl, [...reactIntlRegEx]],
    [Libraries.VueI18n, [...vueI18nRegEx]],
    [Libraries.I18nextVue, [...i18nextVueRegEx]],
    [Libraries.FluentVue, [...fluentVueRegEx]],
    [Libraries.Transloco, [...translocoRegEx]],
    [Libraries.NextI18next, [...nextI18nextRegEx]],
    [Libraries.NuxtI18n, [...nuxtI18nRegEx]],
    [Libraries.SvelteI18n, [...svelteI18nRegEx]],
]);

const FRAMEWORKS: Libraries[] = [
    Libraries.AngularNgxTranslate,
    Libraries.ReactI18next,
    Libraries.ReactIntl,
    Libraries.LinguiJs,
    Libraries.NextIntl,
    Libraries.VueI18n,
    Libraries.I18nextVue,
    Libraries.FluentVue,
    Libraries.Transloco,
    Libraries.NextI18next,
    Libraries.NuxtI18n,
    Libraries.SvelteI18n,
];

const DEFAULT_PROJECT_PATHS: Record<Libraries, string> = {
    [Libraries.AngularNgxTranslate]: './src/app/**/*.{html,ts}',
    [Libraries.ReactI18next]:        './src/**/*.{tsx,ts,jsx,js}',
    [Libraries.ReactIntl]:           './src/**/*.{tsx,ts,jsx,js}',
    [Libraries.LinguiJs]:            './src/**/*.{tsx,ts,jsx,js}',
    [Libraries.NextIntl]:            './src/**/*.{tsx,ts,jsx,js}',
    [Libraries.VueI18n]:             './src/**/*.{vue,ts,js}',
    [Libraries.I18nextVue]:          './src/**/*.{vue,ts,js}',
    [Libraries.FluentVue]:           './src/**/*.{vue,ts,js}',
    [Libraries.Transloco]:           './src/app/**/*.{html,ts}',
    [Libraries.NextI18next]:         './src/**/*.{tsx,ts,jsx,js}',
    [Libraries.NuxtI18n]:            './pages/**/*.{vue,ts,js}',
    [Libraries.SvelteI18n]:          './src/**/*.{svelte,ts,js}',
};

const DEFAULT_LANG_PATHS: Record<Libraries, string> = {
    [Libraries.AngularNgxTranslate]: './src/assets/i18n/*.json',
    [Libraries.ReactI18next]:        './public/locales/**/*.json',
    [Libraries.ReactIntl]:           './src/locales/*.json',
    [Libraries.LinguiJs]:            './src/locales/*.json',
    [Libraries.NextIntl]:            './messages/*.json',
    [Libraries.VueI18n]:             './src/locales/*.json',
    [Libraries.I18nextVue]:          './src/locales/*.json',
    [Libraries.FluentVue]:           './src/locales/*.json',
    [Libraries.Transloco]:           './src/assets/i18n/*.json',
    [Libraries.NextI18next]:         './public/locales/**/*.json',
    [Libraries.NuxtI18n]:            './locales/*.json',
    [Libraries.SvelteI18n]:          './src/locales/*.json',
};

export {Libraries, libraries, DEFAULT_LANG_PATHS, DEFAULT_PROJECT_PATHS, FRAMEWORKS};
