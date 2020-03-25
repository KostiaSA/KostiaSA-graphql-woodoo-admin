import { ITable } from "../../../voodoo-shared/ISchema";
import { apolloExecute } from "../apolloExecute";
import { gql } from "@apollo/client";

export async function getTable(db_name?: String, table_schema?: String, table_name?: String): Promise<ITable> {
    let query = gql`
                query ($db_name:String, $table_schema:String, $table_name:String) {
                    table(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
            }`;

    return (await apolloExecute(query, { db_name, table_schema, table_name })).table;
}

