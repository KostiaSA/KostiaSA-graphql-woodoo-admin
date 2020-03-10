const cyrillicToTranslit = require("cyrillic-to-translit-js");

export function translitToGraphQL(name: string): string {
    let ret = cyrillicToTranslit().transform(name, "_");
    ret = ret.replace(/[^_a-zA-Z0-9+]+/gi, '_');
    if ("0123456789".indexOf(ret[0]) > -1)
        ret = "_" + ret;
    return ret;
}