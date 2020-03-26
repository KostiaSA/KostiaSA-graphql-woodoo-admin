const deepmerge = require("deepmerge");

export function deepMerge(o1: any, o2: any): any {

    const combineMerge = (target: any[], source: any[], options: any) => {
        const destination = target.slice()

        source.forEach((item, index) => {
            if (typeof destination[index] === 'undefined' || destination[index] === null) {
                destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
            } else if (options.isMergeableObject(item)) {
                destination[index] = deepmerge(target[index], item, options)
            }
        })
        return destination
    }

    return deepmerge(o1, o2, { arrayMerge: combineMerge });
}
