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

    const query_result = useQuery<{ database: IDatabase, column: IColumn }>(query, { variables: { db_name, table_schema, table_name, column_name } });

    const history = useHistory();


    const [column_form] = Form.useForm();

    // const saveDatabaseAction = async () => {
    //     if (await isFormValidatedOk(tableEditForm)) {
    //         let query = gql`
    //             mutation ($db: JSON!) {
    //                 save_database(database: $db)
    //             }
    //         `;
    //         await apolloExecute(query, { db: JSON.stringify(state.newDb) })
    //         //await saveDatabase({ variables: { db: JSON.stringify(state.newDb) } });
    //         await refetch();
    //         setState({ ...state, dbEditorMode: "none" });
    //         setDbState({});
    //         //console.log("database saved !!!");
    //     }
    //     else {
    //         Modal.error({ title: t("first_correct_the_errors"), centered: true });
    //     }

    // }


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

    //const [dbState, setDbState] = useState<{ [db_name: string]: string }>({});


    return useObserver(() => {

        if (!query_result.data)
            return null;

        console.log(query_result.data);

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
                    onValuesChange={(changedFields: any, allFields: any) => {
                        //state.newDb = deepMerge(state.newDb, changedFields)
                    }}
                >
                    {/* <Form.Item {...groupHeaderFormItemLayout}>
                        <h3 className={`form-title-color`}>{t("API_GRAPHQL_info")}</h3>
                    </Form.Item> */}

                    {/* <Form.Item name="name" label={t("api_name")} rules={getDatabaseApiNameRules(state.dbEditorMode === "add")}
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input autoComplete="off" style={{ maxWidth: 400 }} disabled={state.dbEditorMode === "edit"} />
                    </Form.Item>
 */}
                    <Form.Item name="alias" label={t("api_name")} rules={getDatabaseApiPrefixRules()}>
                        <Input autoComplete="off" style={{ maxWidth: 150 }} />
                    </Form.Item>

                    <Form.Item name="description" label={t("description")}
                        rules={[{ max: 255, message: t("max_length_exceeded", { name: t("description"), length: 255 }) }]}

                    >
                        <Input autoComplete="off" style={{ maxWidth: 400 }} />
                    </Form.Item>


                    <Form.Item name="type" label={t("server_type")} >
                        <Select defaultValue="mssql" style={{ width: 120 }}>
                            {DATABASE_TYPES.map((db) => <Option value={db} key={db} >{db}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name={["connection", "host"]}
                        label={t("server_host")}
                        rules={[
                            {
                                required: true,
                                message: t("cannot_be_empty", { name: t("server_host") })
                            },
                            {
                                max: 255,
                                message: t("max_length_exceeded", { name: t("server_host"), length: 255 })
                            },

                        ]}
                    >
                        <Input autoComplete="off" style={{ maxWidth: 400 }} />
                    </Form.Item>

                    <Form.Item
                        name={["connection", "port"]}
                        label={t("server_port")}
                        rules={[{ type: "integer", min: 0, max: 65535 }]}
                    >
                        <InputNumber max={65535} style={{ maxWidth: 120 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "username"]} label={t("login")}>
                        <Input autoComplete="off" style={{ maxWidth: 250 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "password"]} label={t("password")} >
                        <Input.Password autoComplete="off" style={{ maxWidth: 250 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "database"]} label={t("database")}>
                        <Input autoComplete="off" style={{ maxWidth: 400 }} />
                    </Form.Item>

                </Form>
            </div>

        )
    });


}
