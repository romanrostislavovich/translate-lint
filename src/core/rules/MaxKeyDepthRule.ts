import { IRule } from './../interface';
import { ErrorTypes, ErrorFlow } from './../enums';
import { ResultErrorModel, KeyModel } from './../models';

class MaxKeyDepthRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.maxKeyDepth;
    public handler: ErrorTypes;
    private readonly maxDepth: number;

    constructor(handler: ErrorTypes, maxDepth: number) {
        this.handler = handler;
        this.maxDepth = maxDepth;
    }

    public check(_viewKeys: KeyModel[], languagesKeys: KeyModel[]): ResultErrorModel[] {
        return languagesKeys.flatMap((key: KeyModel) => {
            const depth: number = key.name.split('.').length;
            if (depth > this.maxDepth) {
                return key.languages.map((languagePath: string) => {
                    return new ResultErrorModel(
                        key.name,
                        this.flow,
                        this.handler,
                        languagePath,
                        String(this.maxDepth),
                    );
                });
            }
            return [];
        });
    }
}

export { MaxKeyDepthRule };