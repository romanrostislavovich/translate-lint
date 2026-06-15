import {ngxTranslateRegEx} from "./angular-ngx-translate";
import {linguiRegEx} from "./lingui";
import {nextIntlRegEx} from "./next-intl";
import {reactI18NextRegEx} from "./react-i18next";
import {reactIntlRegEx} from "./react-intl";

const enum Libraries {
    AngularNgxTranslate = 'angular-ngx-translate',
    LinguiJs = 'lingui-js',
    NextIntl = 'next-intl',
    ReactI18next = 'react-i18next',
    ReactIntl = 'react-intl',
}

const libraries:  Map<Libraries, string[]> = new Map<Libraries, string[]>([
    [Libraries.AngularNgxTranslate, [...ngxTranslateRegEx]],
    [Libraries.LinguiJs, [...linguiRegEx]],
    [Libraries.NextIntl, [...nextIntlRegEx]],
    [Libraries.ReactI18next, [...reactI18NextRegEx]],
    [Libraries.ReactIntl, [...reactIntlRegEx]]
]);

export {Libraries, libraries};
