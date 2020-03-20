import * as React from "react";
import { Fragment, useState, useContext, } from "react";
import { IDatabase, ITable, IColumn, } from "../../../voodoo-shared/ISchema";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    Col,
    Row,
    Table,
    Popconfirm,
    Modal,
} from "antd";

import Column from "antd/lib/table/Column";
import _ from "lodash";
import { deepMerge } from '../utils/deepMerge';
import { getDatabaseApiPrefixRules, getDatabaseApiNameRules } from '../validators/validators';
import { DATABASE_TYPES, GET_DATABASE_DEFAULT_PORT } from '../const';
import { apolloClient } from "../apolloClient";
import { apolloExecute } from "../apolloExecute";
import { AppStateContext } from "../App";
import { appState } from "../AppState";
import { useObserver } from "mobx-react-lite";
import { isFormValidatedOk } from "../utils/isFormValidatedOk";
import { useHistory, useParams } from "react-router-dom";

const { Option } = Select;

interface IState {
    dbEditorMode: "none" | "add" | "edit",
    newDb?: IDatabase,
}

export function TableColumnSetupPage() {
    const { t, i18n } = useTranslation();

    let { db_name, table_schema, table_name, column_name } = useParams();

    let query = gql`
        query ($db_name:String, $table_schema:String, $table_name:String, $column_name:String) {
            database(db_name:$db_name)
            column(db_name:$db_name, table_schema:$table_schema, table_name:$table_name, column_name:$column_name)
        }`;

    //    const query_result = useQuery<{ database: IDatabase, column: IColumn }>(query, { fetchPolicy: "cache-first", variables: { db_name, table_schema, table_name, column_name } });
    const query_result = useQuery<{ database: IDatabase, column: IColumn }>(query, { variables: { db_name, table_schema, table_name, column_name } });

    const history = useHistory();


    const [column_form] = Form.useForm();

    let [changedFields, setChangedFields] = useState();



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
            let column = table_to_update.columns[columnIndex];
            //console.log("column-до", column)
            table_to_update.columns[columnIndex] = deepMerge(column, changedFields)
            //console.log("column-после", column)

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



    //const [dbState, setDbState] = useState<{ [db_name: string]: string }>({});


    return useObserver(() => {

        if (!query_result.data)
            return null;

        //console.log(query_result.data);

        return (
            <div style={{ maxWidth: 1200, margin: "20px 20px 0 20px" }}>

                <h2>{t("Column_API")}: <span style={{ fontSize: 18, color: "gray" }}>{db_name}.{table_schema}.{table_name}.</span>{column_name}</h2>
                <Form

                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 15 }}
                    layout="horizontal"
                    size="small"
                    form={column_form}
                    initialValues={query_result.data?.column}
                    onValuesChange={(_changedFields: any, allFields: any) => {
                        setChangedFields(deepMerge(changedFields || {}, _changedFields));
                        //console.log("changedFields", changedFields);
                    }}
                >
                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3 className={`form-title-color`}>{t("API_GRAPHQL_info")}</h3>
                    </Form.Item>

                    {/* <Form.Item name="name" label={t("api_name")} rules={getDatabaseApiNameRules(state.dbEditorMode === "add")}
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input autoComplete="off" style={{ maxWidth: 400 }} disabled={state.dbEditorMode === "edit"} />
                    </Form.Item>
 */}
                    <Form.Item name="alias" label={t("api_name")} rules={getDatabaseApiPrefixRules()}>
                        <Input autoComplete="off" style={{ maxWidth: 350 }} className="api-name-text-color" />
                    </Form.Item>

                    <Form.Item name="description" label={t("description")}
                        rules={[{ max: 255, message: t("max_length_exceeded", { name: t("description"), length: 255 }) }]}

                    >
                        <Input autoComplete="off" style={{ maxWidth: 500 }} />
                    </Form.Item>

                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3 className={`form-title-color`}>{t("API_GRAPHQL_info")}</h3>
                    </Form.Item>


                    <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
                        <Button key="back" size="middle" onClick={cancelChanges}>
                            {!changedFields ? t("Close") : t("Cancel")}
                        </Button>
                        <Button key="submit" size="middle" type="primary" style={{ marginLeft: 8 }} onClick={saveChanges} disabled={!changedFields}>
                            {t("Save")}
                        </Button>
                    </Form.Item>
                </Form>
            </div>

        )
    });


}
