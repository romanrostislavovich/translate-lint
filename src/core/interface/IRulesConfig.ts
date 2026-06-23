import { ErrorTypes, ToggleRule } from './../enums';
import { IMaxKeyDepthRule, INamespaceRule } from './IAppConfig';

interface IZombieKeysRule {
    type: ErrorTypes;
    fix?: boolean;
}

interface IKeysOnViewsRule {
    type: ErrorTypes;
}

interface IEmptyKeysRule {
    type: ErrorTypes;
}

interface IMisprintKeysRule {
    type: ErrorTypes;
    coefficient?: number;
    ignored?: string[];
}

interface IDeepSearchRule {
    type: ToggleRule;
}

interface IDuplicateKeysRule {
    type: ErrorTypes;
}

interface IMissingTranslationsRule {
    type: ErrorTypes;
    fix?: boolean;
}

interface IRulesConfig {
    zombieKeys: IZombieKeysRule;
    keysOnViews: IKeysOnViewsRule;
    emptyKeys: IEmptyKeysRule;
    misprintKeys: IMisprintKeysRule;
    deepSearch: IDeepSearchRule;
    maxWarning: number;
    ignoredKeys: string[];
    customRegExpToFindKeys: string[] | RegExp[];
    namespaceKeys?: INamespaceRule;
    maxKeyDepth?: IMaxKeyDepthRule;
    duplicateKeys?: IDuplicateKeysRule;
    missingTranslations?: IMissingTranslationsRule;
}

export { IRulesConfig, IZombieKeysRule, IKeysOnViewsRule, IEmptyKeysRule, IMisprintKeysRule, IDeepSearchRule, IDuplicateKeysRule, IMissingTranslationsRule };