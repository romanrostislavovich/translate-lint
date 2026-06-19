import { IRulesConfig } from './IRulesConfig';
import { Libraries } from "../../libraries";
import { ErrorTypes } from '../enums';

interface IFetch {
    get?: Function;
    requestQuery: string;
    responseQuery: string;
    requestHeaders: { [key: string]: string };
}

interface INamespaceRule {
    type: ErrorTypes;
    delimiter: string;
    namespaces: Record<string, string[]>;
    globalNamespaces: string[];
    ignoreInFolders: string[];
}

interface IDefaultValues {
    rules: IRulesConfig;
    fetch: IFetch;
    project: string;
    languages: string;
    frameworkPreset: Libraries;
    fixZombiesKeys?: boolean;
}

interface IAppConfig {
    defaultValues: IDefaultValues;
}

export { IAppConfig, IFetch, INamespaceRule };
