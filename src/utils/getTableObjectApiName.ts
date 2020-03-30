import { ITable, IDatabase } from "../../../voodoo-shared/ISchema";

export function getTableObjectApiName(database: IDatabase, table: ITable): string {
    let prefix = "";
    if (database.prefix && database.prefix.length > 0)
        prefix = database.prefix + "_";
    return prefix + table.object_alias || table.name;
}

