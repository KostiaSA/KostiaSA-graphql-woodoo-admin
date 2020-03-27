import * as React from "react";
import { Fragment, useState, useContext, ReactNode } from 'react';
import { IDatabase, ITable, IColumn, IRefColumn, } from "../../../voodoo-shared/ISchema";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";

import {
    Form,
    Input,
    Button,
    Select,
    Table,
    Modal,
} from "antd";

import Column from "antd/lib/table/Column";
import _ from "lodash";
import { deepMerge } from '../utils/deepMerge';
import { getGraphQlNameRules } from '../validators/validators';
import { apolloExecute } from "../apolloExecute";
import { appState } from "../AppState";
import { useObserver } from "mobx-react-lite";
import { isFormValidatedOk } from "../utils/isFormValidatedOk";
import { useHistory, useParams } from "react-router-dom";
import { deepClone } from "../utils/deepClone";

const { Option } = Select;

type INativeTableColumn = { name: string, type: string };

// interface IState {
//     dbEditorMode: "none" | "add" | "edit",
//     newDb?: IDatabase,
// }

export function TableColumnSetupPage() {
    const { t, i18n } = useTranslation();

    let { db_name, table_schema, table_name, column_name } = useParams();

    let addColumnType: "none" | "object_relationship" | "array_relationship" = "none";

    if (column_name === "new-object-relationship-column") {
        addColumnType = "object_relationship";
    }

    if (column_name === "new-array-relationship-column") {
        addColumnType = "array_relationship";
    }


    let query = gql`
        query ($db_name:String, $table_schema:String, $table_name:String, $column_name:String) {
            databases
            database(db_name:$db_name)
            native_table_columns(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
            column(db_name:$db_name, table_schema:$table_schema, table_name:$table_name, column_name:$column_name)
        }`;

    if (addColumnType !== "none") {
        query = gql`
        query ($db_name:String, $table_schema:String, $table_name:String) {
            databases
            database(db_name:$db_name)
            native_table_columns(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
        }`;
    }

    type QueryResult = { database: IDatabase, databases: IDatabase[], native_table_columns: INativeTableColumn[], column: IColumn };
    const query_result = useQuery<QueryResult>(query, { variables: { db_name, table_schema, table_name, column_name } });
    let databases: IDatabase[] = [];
    if (query_result.data)
        databases = query_result.data.databases;

    //let initColumn: IColumn = undefined as any;
    //let column: IColumn = {} as any;
    let [initColumn, setInitColumn] = useState<IColumn>(undefined as any);
    let [column, setColumn] = useState<IColumn>({} as any);

    let columnType: "field" | "object_relationship" | "array_relationship" = "field";

    console.log("=========  render-render =============", column, initColumn);

    if (addColumnType === "object_relationship") {
        columnType = "object_relationship";
        if (JSON.stringify(column) === "{}") {
            setColumn({
                name: "new_column_name",
                alias: "new_column_name",
                description: "",
                type: "ObjectValue",
                ref_db: db_name,
                ref_schema: table_schema,
                ref_table: table_name,
                ref_columns: []
            });
            setInitColumn({
                name: "new_column_name",
                alias: "new_column_name",
                description: "",
                type: "ObjectValue",
                ref_db: db_name,
                ref_schema: table_schema,
                ref_table: table_name,
                ref_columns: []
            });
        }
    }
    else {
        if (query_result.data) {
            if (JSON.stringify(column) === "{}") {
                setColumn(query_result.data.column);
                setInitColumn(deepClone(query_result.data.column));
            }
            if (query_result.data.column.ref_columns)
                columnType = "object_relationship";
        }
    }

    let isNeedToSave = (): boolean => {
        return JSON.stringify(initColumn) !== JSON.stringify(column);
    }

    const history = useHistory();
    const [column_form] = Form.useForm();

    const groupHeaderFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 5,
            },
        },
    };

    let upsertTable = async (table: ITable) => {
        let query = gql`
                    mutation ($table: JSON!) {
                        save_table(table: $table)
                    }
                `;
        await apolloExecute(query, { table: JSON.stringify(table) })
    }

    const saveChanges = async () => {
        if (await isFormValidatedOk(column_form)) {
            let table_to_update: ITable;
            let query = gql`
                query ($db_name:String, $table_schema:String, $table_name:String) {
                    table(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
            }`;

            table_to_update = (await apolloExecute(query, { db_name: db_name, table_schema, table_name })).table;
            let columnIndex = table_to_update.columns.findIndex((c) => c.name === column_name);
            table_to_update.columns[columnIndex] = column;

            await upsertTable(table_to_update);
        }
        else {
            Modal.error({ title: t("first_correct_the_errors"), centered: true });
            return
        }

        history.goBack();
    }
    const cancelChanges = async () => {
        history.goBack();
    }

    let ref_query = gql`
            query ($db_name: String, $table_schema:String, $table_name:String) {
                ref_tables: database_tables(db_name:$db_name)
                ref_table_columns: native_table_columns(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)

            }`;

    if (columnType !== "object_relationship") {
        ref_query = gql`
            query {
                ping
            }`;
    }

    let ref_query_variables = {
        variables: {
            db_name: column.ref_db,
            table_schema: column.ref_schema,
            table_name: column.ref_table,
        }
    };

    let ref_query_result = useQuery<{ ref_tables: ITable[], ref_table_columns: INativeTableColumn[] }>(ref_query, ref_query_variables);
    let ref_tables: ITable[] = [];
    let ref_table_columns: INativeTableColumn[] = [];
    let ref_schemas: string[] = [];
    if (ref_query_result.data) {
        ref_tables = ref_query_result.data.ref_tables;
        ref_table_columns = ref_query_result.data.ref_table_columns;
        for (let table of ref_tables) {
            if (ref_schemas.indexOf(table.dbo) === -1)
                ref_schemas.push(table.dbo);
        }
    }

    let object_relation_group = (): ReactNode => {


        if (columnType !== "object_relationship")
            return null;
        else
            return (
                <Fragment>

                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3 className={`form-title-color`}>{t("Referenced_object")}</h3>
                    </Form.Item>

                    <Form.Item name="ref_db" label={t("ref_database")} >
                        <Select style={{ width: 250 }}>
                            {databases.map((db) => <Option value={db.name} key={db.name} >{db.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="ref_schema" label={t("ref_schema")} >
                        <Select style={{ width: 150 }}>
                            {ref_schemas.map((dbo) => <Option value={dbo} key={dbo} >{dbo}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="ref_table" label={t("ref_table")} >
                        <Select style={{ width: 450 }}>
                            {ref_tables.map((ref_table) => <Option value={ref_table.name} key={ref_table.name} >{ref_table.name}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Table
                            style={{ maxWidth: 800 }}
                            dataSource={column.ref_columns}
                            //rowKey="column"
                            size="small"
                            bordered
                            pagination={false}
                            title={() =>
                                <div style={{ minHeight: 26 }}>
                                    <h4 style={{ display: "inline" }}>{t("relationship_fields")}</h4>
                                    <Button
                                        disabled={appState.ui_disabled}
                                        style={{ float: "right" }}
                                        size="small"
                                        onClick={() => {
                                            column.ref_columns!.push({ column: "", ref_column: "" });
                                            setColumn(deepClone(column));
                                        }}
                                        className={`form-title-color-add`}
                                    >
                                        {"+ " + t("add_new_field")}
                                    </Button>
                                </div>}
                        >

                            <Column title={table_schema + "." + table_name} key="column"
                                render={(text: string, refCol: IRefColumn, index: number) => {
                                    return (
                                        <Form.Item name={["ref_columns", index, "column"]} style={{ margin: 0 }}>
                                            <Select style={{ width: 300 }}>
                                                {query_result.data?.native_table_columns.map((col) =>
                                                    <Option value={col.name} key={col.name} >{col.name} ({col.type})</Option>
                                                )}
                                            </Select>
                                        </Form.Item>


                                    )
                                }}
                            />

                            <Column title={column.ref_schema + "." + column.ref_table} key="ref_column"
                                render={(text: string, refCol: IRefColumn, index: number) => {
                                    return (
                                        <Form.Item name={["ref_columns", index, "ref_column"]} style={{ margin: 0 }}>
                                            <Select style={{ width: 300 }}>
                                                {ref_table_columns.map((col) =>
                                                    <Option value={col.name} key={col.name} >{col.name} ({col.type})</Option>
                                                )}
                                            </Select>
                                        </Form.Item>
                                    )
                                }}
                            />
                            <Column title={<span style={{ float: "right" }}>{t("actions")}</span>} key="operation"
                                render={(text, record: IColumn, index: number) => {
                                    if (!record.disabled)
                                        return (
                                            <Fragment>
                                                <Button
                                                    size="small"
                                                    type="link" danger
                                                    style={{ float: "right", cursor: "pointer" }}
                                                    className={`form-title-color-delete`}
                                                    onClick={() => {
                                                        column.ref_columns!.splice(index, 1);
                                                        setColumn(deepClone(column));
                                                        column_form.resetFields();
                                                    }}

                                                >
                                                    {t("delete")}{index}
                                                </Button>
                                            </Fragment>
                                        )
                                    else
                                        return null;
                                }}
                            />


                        </Table>

                    </Form.Item>

                </Fragment>
            );
    }


    return useObserver(() => {

        if (!query_result.data)
            return null;

        //console.log(query_result.data);

        let top_title: ReactNode;
        if (addColumnType == "object_relationship")
            top_title = <h2 className={`form-title-color-add`} style={{ textAlign: "center" }}>{t("Adding_new_object_relationship_column")}</h2>;


        return (
            <div style={{ maxWidth: 1200, margin: "20px 20px 0 20px" }}>

                {top_title}

                <h2>
                    {t("Column_API")}:
                    <span style={{ fontSize: 18, color: "gray" }}>{db_name}.{table_schema}.{table_name}.</span>
                    <span className="api-name-text-color">{column.alias}</span>
                </h2>
                <Form

                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 15 }}
                    layout="horizontal"
                    size="small"
                    form={column_form}
                    initialValues={column}
                    onValuesChange={(_changedFields: any, allFields: any) => {
                        setColumn(deepMerge(JSON.parse(JSON.stringify(column)), _changedFields));
                        //setChangedColumn(deepMerge(changedColumn || {}, _changedFields));
                        console.log("_changedFields", _changedFields);
                        //console.log("changedApiNamesFields", changedColumn);
                    }}
                >
                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3 className={`form-title-color`}>{t("API_GRAPHQL_info")}</h3>
                    </Form.Item>

                    <Form.Item name="alias" label={t("column_api_name")} rules={getGraphQlNameRules()}>
                        <Input autoComplete="off" style={{ maxWidth: 350 }} className="api-name-text-color" />
                    </Form.Item>

                    <Form.Item name="description" label={t("description")}
                        rules={[{ max: 255, message: t("max_length_exceeded", { name: t("description"), length: 255 }) }]}

                    >
                        <Input autoComplete="off" style={{ maxWidth: 500 }} />
                    </Form.Item>

                    {object_relation_group()}


                    <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
                        <Button key="back" size="middle" onClick={cancelChanges} disabled={appState.ui_disabled}>
                            {!isNeedToSave() ? t("Close") : t("Cancel")}
                        </Button>
                        <Button key="submit" size="middle" type="primary" style={{ marginLeft: 8 }} onClick={saveChanges} disabled={!isNeedToSave()}>
                            {t("Save")}
                        </Button>
                    </Form.Item>
                </Form>

            </div>

        )
    });


}
