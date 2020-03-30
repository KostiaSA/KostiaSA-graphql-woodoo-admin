import { GraphQLType } from "graphql";

export function sqlTypeToGraphQLType(sql_type: string): string {

    switch (sql_type.toLowerCase()) {
        case "bit": return "Boolean";
        case "int": return "Int";
        case "smallint": return "Int";
        case "tinyint": return "Int";
        case "char": return "String";
        case "varchar": return "String";
        case "nchar": return "String";
        case "nvarchar": return "String";
        case "text": return "String";
        case "datetime": return "String";
        case "smalldatetime": return "String";
        case "date": return "String";
        case "smalldate": return "String";
        case "timestamp": return "String";
        case "money": return "Float";
        case "uniqueidentifier": return "String";
        case "binary": return "String";
        case "image": return "String";
        default: throw new Error("sqlTypeToGraphQLType(): unknown sql_type " + sql_type);
    }

}

/*
binary
bit
char
datetime
decimal
float
image
int
money
nvarchar
smalldatetime
smallint
smallmoney
text
timestamp
tinyint
uniqueidentifier
varbinary
varchar

*/