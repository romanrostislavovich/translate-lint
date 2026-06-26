import {ErrorTypes, NamingConvention, OutputFormat, ToggleRule} from './enums';
import {IAppConfig} from './interface';
import {Libraries} from "../libraries";

const config: IAppConfig = {
    defaultValues: {
        rule: {
            zombieKeys:  { type: ErrorTypes.warning, fix: false },
            keysOnViews: { type: ErrorTypes.error },
            emptyKeys:   { type: ErrorTypes.warning },
            misprintKeys: { type: ErrorTypes.disable, coefficient: 0.9, ignored: [] },
            deepSearch:  { type: ToggleRule.disable },
            maxWarning:  0,
            ignoredKeys: [],
            customRegExpToFindKeys: [],
            namespaceKeys: { type: ErrorTypes.disable, delimiter: '.', namespaces: {}, globalNamespaces: [], ignoreInFolders: [] },
            maxKeyDepth: { type: ErrorTypes.disable, depth: 4 },
            duplicateKeys: { type: ErrorTypes.disable },
            missingTranslations: { type: ErrorTypes.disable, fix: false },
            keyNamingConvention: { type: ErrorTypes.disable, format: NamingConvention.SCREAMING_SNAKE },
        },
        fetch: {
            requestQuery: "",
            requestHeaders: {},
            responseQuery: ""
        },
        project: './src/app/**/*.{html,ts,resx}',
        languages: './src/assets/i18n/*.{json,yaml,yml}',
        frameworkPreset: Libraries.AngularNgxTranslate,
        format: OutputFormat.stylish,
    }
};

export { config };