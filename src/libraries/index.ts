import {ngxTranslateRegEx} from "./angular-ngx-translate";
import {linguiRegEx} from "./lingui";
import {nextIntlRegEx} from "./next-intl";
import {reactI18NextRegEx} from "./react-i18next";
import {reactIntlRegEx} from "./react-intl";
import {vueI18nRegEx} from "./vue-i18n";
import {i18nextVueRegEx} from "./i18next-vue";
import {fluentVueRegEx} from "./fluent-vue";

const enum Libraries {
    AngularNgxTranslate = 'angular-ngx-translate',
    LinguiJs = 'lingui-js',
    NextIntl = 'next-intl',
    ReactI18next = 'react-i18next',
    ReactIntl = 'react-intl',
    VueI18n = 'vue-i18n',
    I18nextVue = 'i18next-vue',
    FluentVue = 'fluent-vue',
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
]);

export {Libraries, libraries};
