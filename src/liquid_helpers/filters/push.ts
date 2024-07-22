export function push<T>(array: any | null, value: T): T[] {
    
    if (Array.isArray(array) ) {
        if (value === null) {
            return array ?? [];
        }
    
        if (array === null) {
            array = [];
        }
    
        return [...array, value];

        
    }

    return [value];
}