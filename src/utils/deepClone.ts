
export function deepClone<T>(obj: any): T {
    return JSON.parse(JSON.stringify(obj)) as any;
}
