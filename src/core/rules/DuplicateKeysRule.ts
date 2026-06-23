import * as fs from 'fs';
import * as path from 'path';
import { IRule } from '../interface';
import { ErrorFlow, ErrorTypes } from '../enums';
import { ResultErrorModel, KeyModel } from '../models';

interface DuplicateMatch {
    key: string;
    line: number;
}

function findDuplicatesInContent(content: string): DuplicateMatch[] {
    const results: DuplicateMatch[] = [];
    const lines = content.split('\n');
    const seenByIndent = new Map<number, Set<string>>();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const indent = line.search(/\S/);
        if (indent === -1) continue;

        for (const level of seenByIndent.keys()) {
            if (level > indent) seenByIndent.delete(level);
        }

        // Matches both JSON ("key":) and YAML (key:) key patterns
        const match = line.match(/^\s*(?:"((?:[^"\\]|\\.)*)"|([\w.-]+))\s*:/);
        if (!match) continue;

        const key = match[1] ?? match[2];
        if (!seenByIndent.has(indent)) seenByIndent.set(indent, new Set());
        const seen = seenByIndent.get(indent)!;

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

            const ext = path.extname(filePath).toLowerCase();
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