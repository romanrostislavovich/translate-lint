import { IRulesConfig } from './IRulesConfig';
import {Libraries} from "../../libraries";

interface IFetch {
    get?: Function;
    requestQuery: string;
    responseQuery: string;
    requestHeaders: { [key: string]: string };
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

export { IAppConfig, IFetch };
