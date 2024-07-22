export function push<T>(array: T[] | null, value: T | null): T[] {
    if (value === null) {
        return array ?? [];
    }

    if (array === null) {
        array = [];
    }

    return [...array, value];
}