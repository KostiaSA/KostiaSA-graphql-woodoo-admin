import * as React from "react";
import { useTranslation } from "react-i18next";
import { useObserver } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Tabs, Table, Popconfirm, Button, Checkbox, Form, Switch } from "antd";
import { gql, useQuery } from "@apollo/client";
import Column from "antd/lib/table/Column";
import { IDatabase, ITable } from "../../../voodoo-shared/ISchema";
import { Fragment } from 'react';

const { TabPane } = Tabs;

type NativeTableRecord = { schema_name: string, table_name: string };

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
    const [filterOnlyOn, setFilterOnlyOn] = React.useState<boolean>(false);

    let database_native_tables_filtered: NativeTableRecord[] = [];
    if (query_result.data) {
        database_native_tables_filtered = query_result.data?.database_native_tables.filter((item: NativeTableRecord) => {
            let res = true;
            if (filterOnlyOn && isTable_off(item.schema_name, item.table_name))
                res = false;
            return res;
        });
    }

    // ********* ACTIONS *************
    let setTable_on_off = (native_table: NativeTableRecord, on_off_value: boolean) => {
        let table = getTableBySchemaAndName(native_table.schema_name, native_table.table_name);
        if (on_off_value) {

        }
        else {
            table.disabled = true;
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
                            <Form.Item label={t("only_api_on")}>
                                <Switch size="small" checked={filterOnlyOn} onChange={(enable) => setFilterOnlyOn(enable)} />
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
                                    return record.schema_name + "." + record.table_name;
                                }}
                            />
                            <Column title={<span>{t("api_on_off")}</span>} key="api_on_off" align="center"
                                render={(text, record: NativeTableRecord, index) => {
                                    return (
                                        <Checkbox checked={!isTable_off(record.schema_name, record.table_name)} ></Checkbox>
                                    )
                                }}
                            />
                            <Column title={t("api")} dataIndex="api_name" key="api_name" className="database-text-color"
                                render={(text: string, record: NativeTableRecord) => {
                                    if (!isTable_off(record.schema_name, record.table_name))
                                        return query_result.data?.database.prefix + "_" + record.schema_name + "_" + record.table_name;
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