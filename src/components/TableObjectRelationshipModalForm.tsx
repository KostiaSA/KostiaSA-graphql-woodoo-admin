import * as React from "react";
import { useTranslation } from "react-i18next";
import { useObserver } from "mobx-react-lite";
import { useParams, useHistory } from "react-router-dom";
import { Tabs, Table, Popconfirm, Button, Checkbox, Form, Switch, Input, Modal, Select } from "antd";
import { gql, useQuery } from "@apollo/client";
import { appState } from "../AppState";
import { IDatabase, IColumn, ITable } from "../../../voodoo-shared/ISchema";
import { ReactNode, useState } from 'react';
import { useAsync, useAsyncRetry, useUpdateEffect } from "react-use";
import { getTable } from "../schema/getTable";

const { Option } = Select;


export interface ITableObjectRelationshipModalFormProps {
    db_name: string;
    table_schema: string;
    table_name: string;
    column_name: string;
    form_mode: "none" | "add" | "edit";
    children?: ReactNode;
}

export function TableObjectRelationshipModalForm(props: ITableObjectRelationshipModalFormProps) {


    const { t, i18n } = useTranslation();

    const [form] = Form.useForm();

    const databases_query = useQuery<{ databases: IDatabase[], }>(gql`query { databases }`);
    let databases: IDatabase[] = [];
    if (databases_query.data)
        databases = databases_query.data.databases;

    const table = useAsyncRetry(async () => {
        console.log(" useAsyncRetry useAsyncRetry useAsyncRetry ", props);
        return getTable(props.db_name, props.table_schema, props.table_name);
    });

    useUpdateEffect(() => {
        console.log(" useUpdateEffect useUpdateEffect useUpdateEffect ", props);
    })

    const doCancel = () => {
        //set_object_relationship_form_mode("none");
        //set_edited_obj_column(undefined);

    }

    const doSave = async () => {
        // if (await isFormValidatedOk(databaseEditForm)) {
        //     let query = gql`
        //         mutation ($db: JSON!) {
        //             save_database(database: $db)
        //         }
        //     `;
        //     await apolloExecute(query, { db: JSON.stringify(state.newDb) })
        //     //await saveDatabase({ variables: { db: JSON.stringify(state.newDb) } });
        //     await refetch();
        //     setState({ ...state, dbEditorMode: "none" });
        //     setDbState({});
        //     //console.log("database saved !!!");
        // }
        // else {
        //     Modal.error({ title: t("first_correct_the_errors"), centered: true });
        // }

    }

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


    return useObserver(() => {
        //console.log("!query_result.data!query_result.data!query_result.data", query_result.data);

        if (props.form_mode === "none")
            return null;

        console.log("props.form_mode", props.form_mode);
        return (
            <Modal
                width={700}
                visible={true}
                title={<span className={`form-title-color-${props.form_mode}`}>{props.form_mode === "add" ? t("Adding_new_object_relationship") : t("Editing_object_relationship")}</span>}
                destroyOnClose
                footer={[
                    <Button key="back" onClick={doCancel} disabled={appState.ui_disabled}>
                        {t("Cancel")}
                    </Button>,
                    <Button key="submit" type="primary" onClick={doSave} disabled={appState.ui_disabled}>
                        {t("Save")}
                    </Button>,
                ]}
            >
                <Form

                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 15 }}
                    layout="horizontal"
                    size="small"
                    form={form}
                    onValuesChange={(changedFields: any, allFields: any) => {
                        // state.newDb = deepMerge(state.newDb, changedFields)
                    }}
                >
                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3 className={`form-title-color-${props.form_mode}`}>{t("API_GRAPHQL_info")}</h3>
                    </Form.Item>

                    <Form.Item name="ref_db" label={t("ref_database")} >
                        <Select style={{ width: 250 }}>
                            {databases.map((db) => <Option value={db.name} key={db.name} >{db.name}</Option>)}
                        </Select>
                    </Form.Item>

                    {/* <Form.Item name="ref_schema" label={t("ref_schema")} >
                        <Select style={{ width: 150 }}>
                            {query_result.data.databases.map((db) => <Option value={db.name} key={db.name} >{db.name}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item name="name" label={t("api_name")} rules={getDatabaseApiNameRules(object_relationship_form_mode === "add")}
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input autoComplete="off" style={{ maxWidth: 400 }} disabled={object_relationship_form_mode === "edit"} className="api-name-text-color" />
                    </Form.Item>

                    <Form.Item name="prefix" label={t("api_prefix")} rules={getDatabaseApiPrefixRules()}>
                        <Input autoComplete="off" style={{ maxWidth: 150 }} className="api-name-text-color" />
                    </Form.Item> */}

                    <Form.Item name="description" label={t("description")}
                        rules={[{ max: 255, message: t("max_length_exceeded", { name: t("description"), length: 255 }) }]}

                    >
                        <Input autoComplete="off" style={{ maxWidth: 400 }} />
                    </Form.Item>

                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3 className={`form-title-color-${props.form_mode}`}>{t("connection_options")}</h3>
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
            </Modal>

        );
    });

}