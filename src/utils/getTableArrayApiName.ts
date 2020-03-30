import { ITable, IDatabase } from "../../../voodoo-shared/ISchema";

export function getTableArrayApiName(database: IDatabase, table: ITable): string {
    let prefix = "";
    if (database.prefix && database.prefix.length > 0)
        prefix = database.prefix + "_";

    return prefix + table.array_alias || table.name + "s";
}

