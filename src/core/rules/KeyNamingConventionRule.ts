import { IRule } from './../interface';
import { ErrorFlow, ErrorTypes, NamingConvention } from './../enums';
import { ResultErrorModel, KeyModel } from './../models';

const PATTERNS: Record<NamingConvention, RegExp> = {
    [NamingConvention.SCREAMING_SNAKE]: /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/,
    [NamingConvention.camelCase]:       /^[a-z][a-zA-Z0-9]*$/,
    [NamingConvention.snake_case]:      /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/,
    [NamingConvention.kebabCase]:       /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    [NamingConvention.PascalCase]:      /^[A-Z][a-zA-Z0-9]*$/,
};

class KeyNamingConventionRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.keyNamingConvention;
    public handler: ErrorTypes;
    private readonly format: NamingConvention;

    constructor(handler: ErrorTypes, format: NamingConvention) {
        this.handler = handler;
        this.format = format;
    }

    public check(_viewKeys: KeyModel[], languagesKeys: KeyModel[]): ResultErrorModel[] {
        const pattern: RegExp = PATTERNS[this.format];
        return languagesKeys.flatMap((key: KeyModel) => {
            const invalidSegment: string | undefined = key.name.split('.').find(seg => !pattern.test(seg));
            if (invalidSegment === undefined) {
                return [];
            }
            return key.languages.map((languagePath: string) =>
                new ResultErrorModel(
                    key.name,
                    this.flow,
                    this.handler,
                    languagePath,
                    `${invalidSegment}|${this.format}`,
                )
            );
        });
    }
}

export { KeyNamingConventionRule };