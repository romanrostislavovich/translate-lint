import * as path from 'node:path';
import { IRule } from '../interface';
import { ErrorFlow, ErrorTypes } from '../enums';
import { ResultErrorModel, KeyModel } from '../models';

class MissingTranslationsRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.missingTranslations;
    public handler: ErrorTypes;
    private readonly files: string[];

    constructor(handler: ErrorTypes = ErrorTypes.warning, files: string[] = []) {
        this.handler = handler;
        this.files = files;
    }

    public check(_viewKeys: KeyModel[], languagesKeys: KeyModel[]): ResultErrorModel[] {
        if (this.files.length < 2) return [];

        const result: ResultErrorModel[] = [];

        for (const key of languagesKeys) {
            if (key.languages.length >= this.files.length) continue;

            const presentFiles = new Set(key.languages);
            const missingFiles = this.files.filter(f => !presentFiles.has(f));

            for (const missingFile of missingFiles) {
                result.push(new ResultErrorModel(
                    key.name,
                    this.flow,
                    this.handler,
                    missingFile,
                    key.languages.map(l => path.basename(l)),
                ));
            }
        }

        return result;
    }
}

export { MissingTranslationsRule };