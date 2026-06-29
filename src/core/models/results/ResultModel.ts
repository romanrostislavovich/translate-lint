import { isArray } from 'lodash';
import chalk from 'chalk';

import { ResultFileModel } from './ResultFileModel';
import { ResultErrorModel } from './ResultErrorModel';
import { ErrorFlow, ErrorTypes } from '../../enums';
import { ILogger } from '../../interface';
import { StylishLogger } from '../StylishLogger';
import { ICoverageReport, ResultCliModel } from './ResultCliModel';

class ResultModel extends StylishLogger {
    public cli: ResultCliModel;
    public files: ResultFileModel[];
    public hasError: boolean;
    public hasWarning: boolean;
    public readonly message: string = `Find missing translation keys in project`;

    constructor(
        cliModel: ResultCliModel,
        files: ResultFileModel[] = [],
        hasError: boolean = false,
        hasWarning: boolean = false,
        logger: ILogger = console,
    ) {
        super(logger, hasError ? ErrorTypes.error : ErrorTypes.warning);
        this.cli = cliModel;
        this.files = files;
        this.hasError = hasError;
        this.hasWarning = hasWarning;
    }

    public printResult(): void {
        if (this.files.length !== 0) {
            this.printMessage(`${this.message}\n`);
            this.files.forEach((file: ResultFileModel) => {
                this.printMessage(`\n\t${file.message()}\n`, file.errorType);
                file.errors.forEach((error: ResultErrorModel) => {
                     isArray(error.message())
                         ? (error.message() as string[]).map((message: string) => {
                             this.printMessage(`\t\t${message}\n`, error.errorType);
                         })
                         : this.printMessage(`\t\t${error.message()}\n`, error.errorType);
                });
            });
        }
    }

    public printSummery(): void {
        if (this.cli.hasWarnings() || this.cli.hasErrors()) {
            const totalErrorType: ErrorTypes = this.cli.isFullOfWarning() || this.cli.hasErrors() ? ErrorTypes.error : ErrorTypes.warning;
            const emptyKeys: ResultErrorModel[] = this.cli.errors.filter((x) => x.errorFlow === ErrorFlow.emptyKeys);
            const zombieKeys: ResultErrorModel[] = this.cli.errors.filter((x) => x.errorFlow === ErrorFlow.zombieKeys);
            const keysOnViews: ResultErrorModel[] = this.cli.errors.filter((x) => x.errorFlow === ErrorFlow.keysOnViews);
            const misprintKeys: ResultErrorModel[] = this.cli.errors.filter((x) => x.errorFlow === ErrorFlow.misprintKeys);

            this.printMessage(`\nFind following errors:`, totalErrorType);
            
            if (emptyKeys.length !== 0) {
                const errorType:ErrorTypes = this.cli.isFullOfWarning() ? ErrorTypes.error : emptyKeys[0].errorType;
                this.printMessage(`Empty Keys: \t ${emptyKeys.length}`,errorType);
            }

            if (zombieKeys.length !== 0) {
                const errorType:ErrorTypes = this.cli.isFullOfWarning() ? ErrorTypes.error : zombieKeys[0].errorType;
                this.printMessage(`Zombie Keys: \t ${zombieKeys.length}`, errorType);
            }

            if (keysOnViews.length !== 0) {
                const errorType:ErrorTypes = this.cli.isFullOfWarning() ? ErrorTypes.error : keysOnViews[0].errorType;
                this.printMessage(`Key On Views: \t ${keysOnViews.length}`, errorType);
            }


            if (misprintKeys.length !== 0) {
                const errorType:ErrorTypes = this.cli.isFullOfWarning() ? ErrorTypes.error : misprintKeys[0].errorType;
                this.printMessage(`Misprint Keys: \t ${misprintKeys.length}`, errorType);
            }


            this.printMessage(`--------------------`, totalErrorType);
            this.printMessage(`TOTAL: \t\t ${this.cli.countWarnings() + this.cli.countErrors()}`, totalErrorType);
            this.printMessage(`\n`);
        }
    }

    public printCoverage(): void {
        const highThreshold: number = 80;
        const mediumThreshold: number = 60;
        const { totalKeys, usedKeys, percentage }: ICoverageReport = this.cli.coverage;
        if (totalKeys === 0) { return; }
        const color: chalk.Chalk = percentage >= highThreshold ? chalk.green : percentage >= mediumThreshold ? chalk.yellow : chalk.red;

        process.stdout.write(color(`--------------------\nCoverage: ${percentage}% (${usedKeys}/${totalKeys} keys used)\n--------------------\n\n`));
    }

    public toJson(elapsed?: number): object {
        const errors: object[] = this.cli.errors.map((error: ResultErrorModel) => {
            const msg: string | string[] | null = error.message();
            return {
                key:       error.value,
                errorType: error.errorType,
                rule:      error.errorFlow,
                file:      error.currentPath,
                message:   isArray(msg) ? msg : [msg],
            };
        });

        const base: object = {
            errors,
            summary: {
                total:    this.cli.countWarnings() + this.cli.countErrors(),
                errors:   this.cli.countErrors(),
                warnings: this.cli.countWarnings(),
            },
            coverage: this.cli.coverage,
        };

        if (elapsed !== undefined) {
            return {
                ...base,
                stats: {
                    viewFiles:     this.cli.viewFiles,
                    languageFiles: this.cli.languageFiles,
                    elapsedMs:     elapsed,
                },
            };
        }

        return base;
    }

    public toJunit(): string {
        const byFile: Map<string, ResultErrorModel[]> = new Map<string, ResultErrorModel[]>();
        for (const error of this.cli.errors) {
            const list: ResultErrorModel[] = byFile.get(error.currentPath) ?? [];
            list.push(error);
            byFile.set(error.currentPath, list);
        }

        const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>'];
        lines.push(`<testsuites name="translate-lint" tests="${this.cli.errors.length}" failures="${this.cli.countErrors()}" warnings="${this.cli.countWarnings()}">`);

        for (const [file, fileErrors] of byFile) {
            lines.push(`  <testsuite name="${this.escapeXml(file)}" tests="${fileErrors.length}" failures="${fileErrors.length}">`);
            for (const error of fileErrors) {
                const msg: string | string[] | null = error.message();
                const msgStr: string = isArray(msg) ? (msg as string[]).join('; ') : (msg ?? '');
                lines.push(`    <testcase name="${this.escapeXml(error.value)}" classname="${this.escapeXml(file)}">`);
                lines.push(`      <failure message="${this.escapeXml(msgStr)}" type="${error.errorType}"/>`);
                lines.push('    </testcase>');
            }
            lines.push('  </testsuite>');
        }

        lines.push('</testsuites>');
        return lines.join('\n') + '\n';
    }

    public printStats(elapsed: number): void {
        const msPerSecond: number = 1000;
        const timeDecimals: number = 3;
        const lines: string[] = [
            '\n--------------------',
            'Stats:',
            `View files:       ${this.cli.viewFiles}`,
            `Language files:   ${this.cli.languageFiles}`,
            `Total keys:       ${this.cli.coverage.totalKeys}`,
            `Time:             ${(elapsed / msPerSecond).toFixed(timeDecimals)}s`,
            '--------------------\n',
        ];
        process.stdout.write(lines.join('\n'));
    }

    private escapeXml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}

export { ResultModel };
