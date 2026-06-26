import * as fs from 'fs';
import * as path from 'path';
import { IRule } from '../interface';
import { ErrorFlow, ErrorTypes } from '../enums';
import { ResultErrorModel, KeyModel } from '../models';

interface IDuplicateMatch {
    key: string;
    line: number;
}

function findDuplicatesInContent(content: string): IDuplicateMatch[] {
    const results: IDuplicateMatch[] = [];
    const lines: string[] = content.split('\n');
    const seenByIndent: Map<number, Set<string>> = new Map<number, Set<string>>();

    for (let i: number = 0; i < lines.length; i++) {
        const line: string = lines[i];
        const indent: number = line.search(/\S/);
        if (indent === -1) continue;

        for (const level of seenByIndent.keys()) {
            if (level > indent) seenByIndent.delete(level);
        }

        // Matches both JSON ("key":) and YAML (key:) key patterns
        const match: RegExpMatchArray | null = line.match(/^\s*(?:"((?:[^"\\]|\\.)*)"|([\w.-]+))\s*:/);
        if (!match) continue;

        const [, firstGroup, secondGroup]: Array<string | undefined> = match;
        const key: string = (firstGroup ?? secondGroup)!;
        if (!seenByIndent.has(indent)) seenByIndent.set(indent, new Set());
        const seen: Set<string> = seenByIndent.get(indent)!;

        if (seen.has(key)) {
            results.push({ key, line: i + 1 });
        } else {
            seen.add(key);
        }
    }

    return results;
}

class DuplicateKeysRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.duplicateKeys;
    public handler: ErrorTypes;
    private readonly files: string[];

    constructor(handler: ErrorTypes, files: string[] = []) {
        this.handler = handler;
        this.files = files;
    }

    public check(_viewKeys: KeyModel[], _languagesKeys: KeyModel[]): ResultErrorModel[] {
        const result: ResultErrorModel[] = [];

        for (const filePath of this.files) {
            let content: string;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch {
                continue;
            }

            const ext: string = path.extname(filePath).toLowerCase();
            if (ext !== '.json' && ext !== '.yaml' && ext !== '.yml') continue;

            for (const { key, line } of findDuplicatesInContent(content)) {
                result.push(new ResultErrorModel(
                    key,
                    this.flow,
                    this.handler,
                    filePath,
                    String(line),
                ));
            }
        }

        return result;
    }
}

export { DuplicateKeysRule, findDuplicatesInContent };