import * as React from "react";
import { useTranslation } from "react-i18next";
import { useObserver } from "mobx-react-lite";
import { useParams, useHistory } from "react-router-dom";
import { Tabs, Table, Popconfirm, Button, Checkbox, Form, Switch, Input } from "antd";
import { gql, useQuery } from "@apollo/client";
import Column from "antd/lib/table/Column";
import { IDatabase, ITable, IColumn } from "../../../voodoo-shared/ISchema";
import { Fragment } from 'react';
import Search from "antd/lib/input/Search";
import Highlighter from "react-highlight-words";
import { apolloExecute } from "../apolloExecute";
import { translitToGraphQL } from "../utils/translitToGraphQL";
import { sqlTypeToGraphQLType } from "../utils/sqlTypeToGraphQLType";
import { useLocalStorage } from 'react-use';
import { getStringHash } from '../utils/getStringHash';
import { GET_DATABASE_DEFAULT_PORT } from "../const";
import { replaceAll } from '../utils/replaceAll';

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
    const history = useHistory();

    let { db_name } = useParams();
    console.log(useParams())

    let localStoragePrefix = "DatabaseApiPage:" + db_name + ":";

    const [activeTabKey, setActiveTabKey] = useLocalStorage<string>(getStringHash(localStoragePrefix + "activeTabKey"), "Tables");

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
    const [filterOnlyActive, setFilterOnlyActive] = useLocalStorage<boolean>(getStringHash(localStoragePrefix + "filterOnlyActive"), false);
    const [filterByName, setFilterByName] = useLocalStorage<string>(getStringHash(localStoragePrefix + "filterByName"), "");

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

                let translate_query = gql`
                    query ($non_en_words:JSON) {
                        translate(non_en_words: $non_en_words )
                    }
                `;

                let { translate } = await apolloExecute(translate_query, { non_en_words: JSON.stringify(native_columns.map((native_col: any) => native_col.name)) });


                let alias_used: { [alias: string]: boolean } = {};

                table = {
                    dbname: db_name || "",
                    columns: native_columns.map((native_col: any) => {
                        let alias = translate[native_col.name];
                        while (alias_used[alias])
                            alias += "_";
                        alias_used[alias] = true;
                        return {
                            name: native_col.name,
                            alias: alias,
                            type: sqlTypeToGraphQLType(native_col.type),
                            sql_type: native_col.type,
                            description: native_col.name,
                            //ref_db?: string;
                            //ref_table?: string;
                            //ref_columns?: { column: string, ref_column: string }[];

                        } as IColumn
                    }),
                    dbo: native_table.schema_name,
                    name: native_table.table_name,
                    description: native_table.schema_name + "." + native_table.table_name,
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

    let getTablesCountStr = (): string => {
        if (query_result.data) {
            let count = query_result.data.database_native_tables.length;
            if (count > 0)
                return ` (${count})`;
        }
        return "";
    }



    return useObserver(() => {

        if (!query_result.data)
            return null;

        let conn = query_result.data?.database.connection;
        let db = conn.host;
        if (conn.port != GET_DATABASE_DEFAULT_PORT(query_result.data?.database.type)) {
            db += ":" + conn.port;
        }
        db += "." + conn.database;


        let db_alias = query_result.data?.database.name;
        if (query_result.data?.database.prefix)
            db_alias = db_alias + " (" + query_result.data?.database.prefix + "_)";

        return (
            <div style={{ maxWidth: 1200, margin: "20px 20px 0 20px" }}>
                <h2>{t("Database_API")}: {db}&nbsp;=>&nbsp;<span className="api-name-text-color">{db_alias}</span></h2>
                <Tabs activeKey={activeTabKey} animated={false} onChange={(key) => setActiveTabKey(key)}>
                    <TabPane tab={t("Tables") + getTablesCountStr()} key="Tables" >
                        <Form layout="inline">
                            <Form.Item label={t("search_by_name")}>
                                <Search
                                    allowClear
                                    size="small"
                                    placeholder={t("input_search_text")}
                                    defaultValue={filterByName}
                                    onSearch={(value: string) => setFilterByName(value)}
                                    style={{ width: 250 }}
                                />
                            </Form.Item>
                            <Form.Item label={t("only_api_on")}>
                                <Switch size="small" checked={filterOnlyActive}
                                    onChange={(enable) => {
                                        setFilterOnlyActive(enable);
                                        localStorage.setItem(localStoragePrefix + "FilterOnlyActive", JSON.stringify(enable));
                                    }}
                                />
                            </Form.Item>
                        </Form>
                        <br></br>
                        <Table
                            dataSource={database_native_tables_filtered}
                            rowKey="prefix"
                            size="small"
                            bordered
                            pagination={{ pageSize: 75 }}
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

                            <Column title={t("table")} dataIndex="table_name" key="table"
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
                            <Column title={t("api_name")} dataIndex="api_name" key="api_name" className="api-name-text-color"
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
                                                <Button size="small" type="link" style={{ float: "right" }}
                                                    // className={`form-title-color-add`}
                                                    onClick={() => {
                                                        history.push("/table-api/" +
                                                            encodeURIComponent(db_name || "_") + "/" +
                                                            encodeURIComponent(record.schema_name || "_") + "/" +
                                                            encodeURIComponent(record.table_name || "_"));
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

                    <TabPane tab={t("Views")} key="Views">
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