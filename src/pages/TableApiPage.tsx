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
import { useLocalStorage } from "react-use";
import { getStringHash } from "../utils/getStringHash";

const { TabPane } = Tabs;

type NativeTableRecord = { schema_name: string, table_name: string };
type INativeTableColumn = { name: string, type: string };

function getTableApiDisplayName(db: IDatabase, table: ITable): string {
    if (db.prefix && db.prefix !== "")
        return db.prefix + "_" + (table.object_alias || "?");
    else
        return table.object_alias || "?";
}

export function TableApiPage() {
    const { t, i18n } = useTranslation();

    const history = useHistory();

    let { db_name, table_schema, table_name } = useParams();

    let localStoragePrefix = "DatabaseApiPage:" + db_name + ":" + table_schema + ":" + table_name + ":";

    let query = gql`
    query ($db_name:String, $table_schema:String, $table_name:String) {
        database(db_name:$db_name)
        table(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
        native_table_columns(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
    }`;

    const query_result = useQuery<{ database: IDatabase, table: ITable, native_table_columns: INativeTableColumn[] }>(query, { variables: { db_name, table_schema, table_name } });

    let columnsByName: { [name: string]: IColumn } = {};

    if (query_result.data) {
        for (let column of query_result.data?.table.columns) {
            let key = column.name;
            columnsByName[key] = column;
        }
    }
    console.log("columnsByName", columnsByName);

    let isColumn_off = (col_name: string): boolean => {
        let column = columnsByName[col_name];
        if (!column)
            return true;
        else
            return !!column.disabled;
    }

    // ********* FILTERS *************
    const [filterOnlyActive, setFilterOnlyActive] = useLocalStorage<boolean>(getStringHash(localStoragePrefix + "filterOnlyActive"), false);
    const [filterByName, setFilterByName] = useLocalStorage<string>(getStringHash(localStoragePrefix + "filterByName"), "");

    let native_columns_filtered: INativeTableColumn[] = [];
    if (query_result && query_result.data) {
        let filterByName_lowered = (filterByName || "").toLowerCase();
        native_columns_filtered = query_result.data.native_table_columns.filter((native_column: INativeTableColumn) => {
            let res = true;
            if (filterOnlyActive && isColumn_off(native_column.name))
                res = false;
            if (typeof filterByName == "string" && filterByName !== "") {
                let column = columnsByName[native_column.name];
                let conditon_1 = (native_column.name).toLowerCase().indexOf(filterByName_lowered) > -1;
                let conditon_2 = column && column.alias && column.alias.toLowerCase().indexOf(filterByName_lowered) > -1;
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
    let setColumn_on_off = async (native_column: INativeTableColumn, on_off_value: boolean) => {

        // reload table 
        let table_to_update: ITable;
        let query = gql`
                query ($db_name:String, $table_schema:String, $table_name:String) {
                    table(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
            }`;

        table_to_update = (await apolloExecute(query, { db_name: db_name, table_schema, table_name })).table;
        let column = table_to_update.columns.find((c) => c.name === native_column.name);// columnsByName[native_column.name];

        if (on_off_value) {
            if (column) {
                column.disabled = false;
            }
            else {
                column = {
                    name: native_column.name,
                    alias: translitToGraphQL(native_column.name),
                    type: sqlTypeToGraphQLType(native_column.type),
                    description: native_column.name,
                    sql_type: native_column.type,
                    //ref_db?: string;
                    //ref_table?: string;
                    //ref_columns?: { column: string, ref_column: string }[];

                } as IColumn
                table_to_update.columns.push(column);
                columnsByName[native_column.name] = column;
            }
        }
        else {
            if (column) {
                column.disabled = true;
            }
        }

        await upsertTable(table_to_update);
        await query_result.refetch();
    }



    return useObserver(() => {

        return (
            <div style={{ maxWidth: 1200, margin: "20px 20px 0 20px" }}>
                <h2>{t("Table_API")}: <span style={{ fontSize: 18, color: "gray" }}>{db_name}.</span>{table_schema}.{table_name}</h2>
                <Tabs defaultActiveKey="1" animated={false}>
                    <TabPane tab={t("Columns")} key="columns" >
                        <Form layout="inline">
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
                            dataSource={native_columns_filtered}
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

                            <Column title={t("table_column")} dataIndex="table_name" key="table" className="table-text-color"
                                render={(text: string, record: INativeTableColumn) => {
                                    return (
                                        <Highlighter
                                            highlightClassName="highlight-text"
                                            searchWords={[filterByName]}
                                            autoEscape={true}
                                            textToHighlight={record.name}
                                        />
                                    )
                                }}
                            />
                            <Column title={t("sql_type")} dataIndex="table_name" key="table" className="table-text-color"
                                render={(text: string, record: INativeTableColumn) => {
                                    return (
                                        <span>{record.type}</span>
                                    )
                                }}
                            />
                            <Column title={<span>{t("api_on_off")}</span>} key="api_on_off" align="center"
                                render={(text, record: INativeTableColumn, index) => {
                                    return (
                                        <Checkbox
                                            checked={!isColumn_off(record.name)}
                                            onChange={(e) => setColumn_on_off(record, e.target.checked)}
                                        >

                                        </Checkbox>
                                    )
                                }}
                            />
                            <Column title={t("api_name")} dataIndex="api_name" key="api_name" className="table-text-colorXXX"
                                render={(text: string, record: INativeTableColumn) => {
                                    if (!isColumn_off(record.name)) {
                                        let col = columnsByName[record.name];
                                        return (
                                            <Highlighter
                                                highlightClassName="highlight-text"
                                                searchWords={[filterByName]}
                                                autoEscape={true}
                                                textToHighlight={col.alias}
                                            />
                                        )
                                        //return query_result.data?.database.prefix + "_" + record.schema_name + "_" + record.table_name;
                                    }
                                    else
                                        return "";
                                }}
                            />
                            <Column title={<span style={{ float: "right" }}>{t("actions")}</span>} key="operation"
                                render={(text, record: INativeTableColumn, index) => {
                                    if (!isColumn_off(record.name))
                                        return (
                                            <Fragment>
                                                <Button size="small" type="link" style={{ float: "right" }}
                                                    // className={`form-title-color-add`}
                                                    onClick={() => {
                                                        //history.push("/database-api/" + encodeURIComponent(record.name));
                                                        history.push("/table-column-api/" +
                                                            encodeURIComponent(db_name || "_") + "/" +
                                                            encodeURIComponent(table_schema || "_") + "/" +
                                                            encodeURIComponent(table_name || "_") + "/" +
                                                            encodeURIComponent(record.name || "_"));

                                                    }}
                                                >{t("column_setup")}
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