import { ErrorTypes, ToggleRule } from './../enums';
import { INamespaceRule } from './IAppConfig';

interface IRulesConfig {
    emptyKeys: ErrorTypes;
    zombieKeys: ErrorTypes;
    keysOnViews: ErrorTypes;
    misprintKeys: ErrorTypes;
    deepSearch: ToggleRule;
    maxWarning: number;
    misprintCoefficient: number;
    ignoredKeys: string[];
    ignoredMisprintKeys: string[];
    customRegExpToFindKeys: string[] | RegExp[];
    namespaceKeys?: INamespaceRule;
}

export { IRulesConfig };
