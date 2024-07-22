function removeBOM(content: string): string {
    if (content.charCodeAt(0) === 0xFEFF) {
        return content.slice(1);
    }
    return content;
}

export function parseAsJson(obj: string): object | null {
    try {
        obj = removeBOM(obj);
        const parsed = JSON.parse(obj, (key, value) => {
            
            return value;
        });

        return parsed as object;
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return null;
    }
}