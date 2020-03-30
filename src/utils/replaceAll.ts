export function replaceAll(str: string, search: string, replacement: string): string {
    return str.replace(new RegExp(escapeRegExp(search), 'g'), replacement);
};

function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}