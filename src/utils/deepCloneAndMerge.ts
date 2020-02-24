import * as _ from "lodash";

export function deepCloneAndMerge<T>(obj1: T, obj2: T): T {
    return _.cloneDeep(_.merge(obj1, obj2))
}