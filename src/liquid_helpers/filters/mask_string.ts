export function maskString(code: string | null, maskLength: number = 6): string | null {
    if (!code) {
        return code;
    }

    const codeToShow = code.slice(-maskLength);

    return codeToShow;
}