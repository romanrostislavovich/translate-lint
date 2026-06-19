export function extractKeys(content: string, patterns: string[]): string[] {
    const combined = new RegExp(patterns.join('|'), 'gm');
    const results: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = combined.exec(content)) !== null) {
        const key = match.slice(1).find(g => g !== undefined);
        if (key) results.push(key);
    }
    return results;
}