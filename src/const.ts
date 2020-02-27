import { DatabaseType } from "../../voodoo-shared/ISchema";

export function GET_DATABASE_DEFAULT_PORT(dbtype: DatabaseType): number {
    switch (dbtype) {
        case "mssql": return 1433;
        case "pg": return 5432;
        default: throw new Error("GET_DATABASE_DEFAULT_PORT: todo for " + dbtype);
    }
}

