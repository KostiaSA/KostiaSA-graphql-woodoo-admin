import * as React from "react";
import { useTranslation } from "react-i18next";
import { useObserver } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Tabs, Table, Popconfirm, Button, Checkbox, Form, Switch, Input } from "antd";
import { gql, useQuery } from "@apollo/client";
import Column from "antd/lib/table/Column";
import { IDatabase, ITable, IColumn } from "../../../voodoo-shared/ISchema";
import { Fragment } from 'react';
import Search from "antd/lib/input/Search";
import Highlighter from "react-highlight-words";
import { apolloExecute } from "../apolloClient";
import { translitToGraphQL } from "../utils/translitToGraphQL";
import { sqlTypeToGraphQLType } from "../utils/sqlTypeToGraphQLType";

const { TabPane } = Tabs;

type NativeTableRecord = { schema_name: string, table_name: string };

function getTableApiDisplayName(db: IDatabase, table: ITable): string {
    if (db.prefix && db.prefix !== "")
        return db.prefix + "_" + (table.object_alias || "?");
    else
        return table.object_alias || "?";
}

export function DatabaseApiPage() {
    const { t, i18n } = useTranslation();

    let { db_name } = useParams();
    console.log(useParams())

    let query = gql`
    query ($db_name: String) {
        database(db_name:$db_name)
        database_native_tables(db_name:$db_name)
        database_tables(db_name:$db_name)
    }`;

    const query_result = useQuery<{ database_native_tables: NativeTableRecord[], database: IDatabase, database_tables: ITable[] }>(query, { variables: { db_name } });

    let tablesByName: { [name: string]: ITable } = {};

    if (query_result.data) {
        for (let table of query_result.data?.database_tables) {
            let key = table.dbo + ":" + table.name;
            tablesByName[key] = table;
        }
    }
    console.log("tablesByName", tablesByName);

    let getTableBySchemaAndName = (schema: string, name: string): ITable => {
        let key = schema + ":" + name;
        return tablesByName[key];
    }

    let isTable_off = (schema: string, name: string): boolean => {
        let table = getTableBySchemaAndName(schema, name);
        if (!table)
            return true;
        else
            return !!table.disabled;
    }

    // ********* FILTERS *************
    const [filterOnlyActive, setFilterOnlyActive] = React.useState<boolean>(false);
    const [filterByName, setFilterByName] = React.useState<string>("");

    let database_native_tables_filtered: NativeTableRecord[] = [];
    if (query_result && query_result.data) {
        let filterByName_lowered = (filterByName || "").toLowerCase();
        database_native_tables_filtered = query_result.data.database_native_tables.filter((native_table: NativeTableRecord) => {
            let res = true;
            if (filterOnlyActive && isTable_off(native_table.schema_name, native_table.table_name))
                res = false;
            if (typeof filterByName == "string" && filterByName !== "") {
                let table = getTableBySchemaAndName(native_table.schema_name, native_table.table_name);
                let conditon_1 = (native_table.schema_name + "." + native_table.table_name).toLowerCase().indexOf(filterByName_lowered) > -1;
                let conditon_2 = table && getTableApiDisplayName((query_result as any).data.database, table).toLowerCase().indexOf(filterByName_lowered) > -1;
                if (!conditon_1 && !conditon_2) {
                    res = false;
                }

            }
            return res;
        });
    }


    let upsertTable = async (table: ITable) => {
        let query = gql`
                    mutation ($table: JSON!) {
                        save_table(table: $table)
                    }
                `;
        await apolloExecute(query, { table: JSON.stringify(table) })
    }

    // ********* ACTIONS *************
    let setTable_on_off = async (native_table: NativeTableRecord, on_off_value: boolean) => {
        let table = getTableBySchemaAndName(native_table.schema_name, native_table.table_name);
        // reload table 
        if (table) {
            let query = gql`
                query ($db_name:String, $table_schema:String, $table_name:String) {
                    table(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
            }`;
            table = (await apolloExecute(query, { db_name: db_name, table_schema: native_table.schema_name, table_name: native_table.table_name })).table;
        }

        if (on_off_value) {
            if (table) {
                table.disabled = false;
            }
            else {
                let query = gql`
                    query ($db_name:String, $table_schema:String, $table_name:String) {
                        native_table_columns(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
                }`;
                let native_columns = (await apolloExecute(query, { db_name: db_name, table_schema: native_table.schema_name, table_name: native_table.table_name })).native_table_columns;

                table = {
                    dbname: db_name || "",
                    columns: native_columns.map((native_col: any) => {
                        return {
                            name: native_col.name,
                            alias: translitToGraphQL(native_col.name),
                            type: sqlTypeToGraphQLType(native_col.type),
                            sql_type: native_col.type,
                            //ref_db?: string;
                            //ref_table?: string;
                            //ref_columns?: { column: string, ref_column: string }[];

                        } as IColumn
                    }),
                    dbo: native_table.schema_name,
                    name: native_table.table_name,
                    object_alias: translitToGraphQL(native_table.schema_name + "_" + native_table.table_name),
                    array_alias: translitToGraphQL(native_table.schema_name + "_" + native_table.table_name) + "s",
                    disabled: false,
                    version: 1,
                }
            }
            await upsertTable(table);
            await query_result.refetch();
        }
        else {
            table.disabled = true;
            await upsertTable(table);
            await query_result.refetch();
        }
    }



    return useObserver(() => {

        return (
            <div style={{ maxWidth: 1200, margin: "20px 20px 0 20px" }}>
                <h2>{t("Database_API")}: {db_name}</h2>
                <Tabs defaultActiveKey="1" animated={false}>
                    <TabPane tab={t("Tables")} key="tables" >
                        <Form
                            layout="inline"
                            className="components-table-demo-control-bar"
                            style={{ marginBottom: 16 }}
                        >
                            <Form.Item label={t("search_by_name")}>
                                <Search
                                    allowClear
                                    size="small"
                                    placeholder={t("input_search_text")}
                                    onSearch={(value: string) => setFilterByName(value)}
                                    style={{ width: 250 }}
                                />
                            </Form.Item>
                            <Form.Item label={t("only_api_on")}>
                                <Switch size="small" checked={filterOnlyActive} onChange={(enable) => setFilterOnlyActive(enable)} />
                            </Form.Item>
                        </Form>
                        <Table
                            dataSource={database_native_tables_filtered}
                            rowKey="prefix"
                            size="small"
                            bordered
                            pagination={{ pageSize: 75, position: "both" }}
                            title={() =>
                                <div style={{ minHeight: 26 }}>
                                    {/* <Button
                                        style={{ float: "right" }}
                                        size="small"
                                        onClick={startAddDatabaseAction}
                                        className={`form-title-color-add`}
                                    >
                                        {"+ " + t("add_new_database")}
                                    </Button> */}
                                </div>}
                        // rowSelection={{
                        //     type: "checkbox",
                        //     getCheckboxProps: (record: NativeTableRecord) => ({
                        //         disabled: record.table_name === 'Disabled User', // Column configuration not to be checked
                        //         name: record.table_name,
                        //     }),
                        // }}
                        >

                            <Column title={t("table")} dataIndex="table_name" key="table" className="database-text-color"
                                render={(text: string, record: NativeTableRecord) => {
                                    return (
                                        <Highlighter
                                            highlightClassName="highlight-text"
                                            searchWords={[filterByName]}
                                            autoEscape={true}
                                            textToHighlight={record.schema_name + "." + record.table_name}
                                        />
                                    )
                                }}
                            />
                            <Column title={<span>{t("api_on_off")}</span>} key="api_on_off" align="center"
                                render={(text, record: NativeTableRecord, index) => {
                                    return (
                                        <Checkbox
                                            checked={!isTable_off(record.schema_name, record.table_name)}
                                            onChange={(e) => setTable_on_off(record, e.target.checked)}
                                        >

                                        </Checkbox>
                                    )
                                }}
                            />
                            <Column title={t("api_name")} dataIndex="api_name" key="api_name" className="database-text-color"
                                render={(text: string, record: NativeTableRecord) => {
                                    if (!isTable_off(record.schema_name, record.table_name)) {
                                        let table = getTableBySchemaAndName(record.schema_name, record.table_name);
                                        return (
                                            <Highlighter
                                                highlightClassName="highlight-text"
                                                searchWords={[filterByName]}
                                                autoEscape={true}
                                                textToHighlight={getTableApiDisplayName((query_result as any).data.database, table)}
                                            />
                                        )
                                        //return query_result.data?.database.prefix + "_" + record.schema_name + "_" + record.table_name;
                                    }
                                    else
                                        return "";
                                }}
                            />
                            <Column title={<span style={{ float: "right" }}>{t("actions")}</span>} key="operation"
                                render={(text, record: NativeTableRecord, index) => {
                                    if (!isTable_off(record.schema_name, record.table_name))
                                        return (
                                            <Fragment>
                                                <Popconfirm
                                                    title={t("delete_database?", { name: record.table_name })}
                                                    okText={t("Yes")}
                                                    cancelText={t("No")}
                                                    onConfirm={async () => {
                                                        //await deleteDatabaseAction(record.name);
                                                    }}>
                                                    <Button size="small" type="link" danger style={{ float: "right", cursor: "pointer" }}
                                                        className={`form-title-color-delete`}
                                                    >
                                                        {t("delete")}
                                                    </Button>
                                                </Popconfirm>
                                                <Button size="small" type="link" style={{ float: "right" }}
                                                    className={`form-title-color-edit`}
                                                    onClick={() => {
                                                        //console.log("start-edit-database, record=", record);
                                                        //startEditDatabaseAction(record);
                                                    }}
                                                >{t("edit")}
                                                </Button>
                                                <Button size="small" type="link" style={{ float: "right" }}
                                                    // className={`form-title-color-add`}
                                                    onClick={() => {
                                                        //history.push("/database-api/" + encodeURIComponent(record.name));
                                                    }}
                                                >{t("api_setup")}
                                                </Button>

                                            </Fragment>
                                        )
                                    else
                                        return null;
                                }}
                            />

                        </Table>
                    </TabPane>

                    <TabPane tab={t("Views")} key="views">
                        Content of Tab Pane 2
                    </TabPane>
                    <TabPane tab={t("Procedures")} key="procedures">
                        Content of Tab Pane 3
                    </TabPane>
                    <TabPane tab={t("Functions")} key="functions">
                        Content of Tab Pane 3
                    </TabPane>
                </Tabs>
            </div>
        );
    });
}