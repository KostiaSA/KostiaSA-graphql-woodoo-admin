import { DatabaseType } from "../../voodoo-shared/ISchema";


export const DATABASE_TYPES: DatabaseType[] = ["SQL Server", "PostgreSQL"];

export function GET_DATABASE_DEFAULT_PORT(dbtype: DatabaseType): number {
    switch (dbtype) {
        case "SQL Server": return 1433;
        case "PostgreSQL": return 5432;
        default: throw new Error("GET_DATABASE_DEFAULT_PORT: todo for " + dbtype);
    }
}

export function GET_DATABASE_DRIVER(dbtype: DatabaseType): string {
    switch (dbtype) {
        case "SQL Server": return "mssql";
        case "PostgreSQL": return "pg";
        default: throw new Error("GET_DATABASE_DRIVER: todo for " + dbtype);
    }
}

export function GET_DATABASE_DEFAULT_SCHEMA(dbtype: DatabaseType): string {
    switch (dbtype) {
        case "SQL Server": return "dbo";
        case "PostgreSQL": return "public";
        default: throw new Error("GET_DATABASE_DEFAULT_SCHEMA: todo for " + dbtype);
    }
}
