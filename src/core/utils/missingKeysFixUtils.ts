
function detectJsonFormat(jsonData: Record<string, any>): 'flat' | 'nested' {
    const keys = Object.keys(jsonData);
    if (keys.length === 0) return 'flat';
    if (keys.some(k => k.includes('.'))) return 'flat';
    if (Object.values(jsonData).some(v => v !== null && typeof v === 'object')) return 'nested';
    return 'flat';
}

function setMissingKey(jsonData: Record<string, any>, keyName: string): void {
    if (!keyName.includes('.') || detectJsonFormat(jsonData) === 'flat') {
        if (!(keyName in jsonData)) {
            jsonData[keyName] = '';
        }
        return;
    }

    const parts = keyName.split('.');
    let current = jsonData;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part] || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part];
    }
    const leaf = parts[parts.length - 1];
    if (!(leaf in current)) {
        current[leaf] = '';
    }
}

export { detectJsonFormat, setMissingKey };