
function detectJsonFormat(jsonData: Record<string, unknown>): 'flat' | 'nested' {
    const keys: string[] = Object.keys(jsonData);
    if (keys.length === 0) return 'flat';
    if (keys.some(k => k.includes('.'))) return 'flat';
    if (Object.values(jsonData).some(v => v !== null && typeof v === 'object')) return 'nested';
    return 'flat';
}

function setMissingKey(jsonData: Record<string, unknown>, keyName: string): void {
    if (!keyName.includes('.') || detectJsonFormat(jsonData) === 'flat') {
        if (!(keyName in jsonData)) {
            jsonData[keyName] = '';
        }
        return;
    }

    const parts: string[] = keyName.split('.');
    let current: Record<string, unknown> = jsonData;
    for (let i: number = 0; i < parts.length - 1; i++) {
        const part: string = parts[i];
        if (!current[part] || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
    }
    const leaf: string = parts[parts.length - 1];
    if (!(leaf in current)) {
        current[leaf] = '';
    }
}

export { detectJsonFormat, setMissingKey };