import { isArray } from 'lodash';
import { IValidationMessage } from '../../interface';
import { ErrorFlow, ErrorTypes } from '../../enums';

class ResultErrorModel implements IValidationMessage  {
    public value: string;
    public errorFlow: ErrorFlow;
    public errorType: ErrorTypes;
    public absentedPath?: string | string[];
    public currentPath: string;
    public suggestions: string[];

    constructor(
        value: string,
        errorFlow: ErrorFlow = ErrorFlow.keysOnViews,
        errorType: ErrorTypes = ErrorTypes.error,
        currentPath: string,
        absentedPath?: string | string[],
        suggestions: string[] = [],
    ) {
        this.value = value;
        this.errorFlow = errorFlow;
        this.errorType = errorType;
        this.currentPath = currentPath;
        this.absentedPath = absentedPath;
        this.suggestions = suggestions;
    }

    public message(): string | string[] | null {
        let message: string | string[] | null = null;
        switch (this.errorFlow) {
            case ErrorFlow.keysOnViews:
                message = isArray(this.absentedPath)
                    ? this.absentedPath.map((path: string) => `Key: '${this.value}' doesn't exist in '${path}'`)
                    : `Key: '${this.value}' doesn't exist in '${this.absentedPath}'`;
                break;
            case ErrorFlow.zombieKeys:
                message = `Key: '${this.value}' doesn't exist in project'`;
                break;
            case ErrorFlow.misprintKeys:
               message = this.suggestions.reduce((accum: string[], item: string) => {
                   accum.push(`Possible match: '${item}' for key '${this.value}'`);
                   return accum;
                }, []);
                break;
            case ErrorFlow.emptyKeys:
                message = `Key: '${this.value}' is empty in ${this.currentPath}`;
                break;
            case ErrorFlow.namespaceKeys:
                message = isArray(this.absentedPath)
                    ? `Key '${this.value}' is not allowed in '${this.currentPath}'. Allowed folders: ${this.absentedPath.join(', ')}`
                    : `Key '${this.value}' is not allowed in '${this.currentPath}'`;
                break;
            case ErrorFlow.maxKeyDepth:
                message = `Key: '${this.value}' exceeds max key depth of ${this.absentedPath} (current depth: ${this.value.split('.').length}) in '${this.currentPath}'`;
                break;
            case ErrorFlow.duplicateKeys:
                message = `Key: '${this.value}' is duplicated in '${this.currentPath}' (line ${this.absentedPath})`;
                break;
            case ErrorFlow.missingTranslations:
                message = isArray(this.absentedPath)
                    ? `Key: '${this.value}' is missing in '${this.currentPath}' (present in: ${this.absentedPath.join(', ')})`
                    : `Key: '${this.value}' is missing in '${this.currentPath}'`;
                break;
            case ErrorFlow.keyNamingConvention: {
                const [segment, format]: string[] = (this.absentedPath as string).split('|');
                message = `Key: '${this.value}' has segment '${segment}' that violates '${format}' naming convention in '${this.currentPath}'`;
                break;
            }
            default:
                message = 'Unknown error please write to the author';
                break;
        }
        return message;
    }
}

export { ResultErrorModel };
