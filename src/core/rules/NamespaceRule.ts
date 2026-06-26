import { IRule } from './../interface';
import { ErrorTypes, ErrorFlow } from './../enums';
import { ResultErrorModel, KeyModel } from './../models';
import { INamespaceRule } from '../interface/IAppConfig';

class NamespaceRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.namespaceKeys;
    public handler: ErrorTypes;
    private namespaceConfig: INamespaceRule;

    constructor(namespaceConfig: INamespaceRule) {
        this.handler = namespaceConfig.type;
        this.namespaceConfig = namespaceConfig;
    }

    public check(viewKeys: KeyModel[], _languagesKeys: KeyModel[]): ResultErrorModel[] {
        const { delimiter, namespaces, globalNamespaces, ignoreInFolders }: INamespaceRule = this.namespaceConfig;
        const result: ResultErrorModel[] = [];

        for (const key of viewKeys) {
            const delimiterIndex: number = key.name.indexOf(delimiter);
            if (delimiterIndex === -1) {
                continue;
            }

            const namespace: string = key.name.slice(0, delimiterIndex);

            if (globalNamespaces.includes(namespace)) {
                continue;
            }

            const allowedFolders: string[] = namespaces[namespace];
            if (!allowedFolders) {
                continue;
            }

            for (const viewPath of key.views) {
                const isIgnored: boolean = ignoreInFolders.some(folder => viewPath.includes(folder));
                if (isIgnored) {
                    continue;
                }

                const isAllowed: boolean = allowedFolders.some(folder => viewPath.includes(folder));
                if (!isAllowed) {
                    result.push(new ResultErrorModel(
                        key.name,
                        this.flow,
                        this.handler,
                        viewPath,
                        allowedFolders,
                    ));
                }
            }
        }

        return result;
    }
}

export { NamespaceRule };