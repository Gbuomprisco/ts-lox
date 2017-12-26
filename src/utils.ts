export function error(line: number, message: string): void {
    report(line, '', message);
    process.exit(65);
}

export function report(line: number, where: string, message: string): void {
    console.error(
        `[line ${line}] Error${where} : ${message}`
    );
}

export function isDigit(current: string): boolean {
    return isNaN(parseInt(current, 10)) === false;
}

export function isAlpha(symbol: string): boolean {
    return (symbol >= 'a' && symbol <= 'z') ||
        (symbol >= 'A' && symbol <= 'Z') ||
        symbol === '_';
}

export function isAlphaNumeric(value: string): boolean {
    return isAlpha(value) || isDigit(value);
}
