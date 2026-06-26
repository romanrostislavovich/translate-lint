import { IRulesConfig } from './IRulesConfig';
import { Libraries } from "../../libraries";
import { ErrorTypes, OutputFormat } from '../enums';

interface IFetch {
    get?: Function;
    requestQuery: string;
    responseQuery: string;
    requestHeaders: { [key: string]: string };
}

interface IMaxKeyDepthRule {
    type: ErrorTypes;
    depth: number;
}

interface INamespaceRule {
    type: ErrorTypes;
    delimiter: string;
    namespaces: Record<string, string[]>;
    globalNamespaces: string[];
    ignoreInFolders: string[];
}

interface IDefaultValues {
    rule: IRulesConfig;
    fetch: IFetch;
    project: string;
    languages: string;
    frameworkPreset: Libraries;
    format: OutputFormat;
}

interface IAppConfig {
    defaultValues: IDefaultValues;
}

export { IAppConfig, IDefaultValues, IFetch, INamespaceRule, IMaxKeyDepthRule };
