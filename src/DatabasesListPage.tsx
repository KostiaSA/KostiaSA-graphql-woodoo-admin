import * as React from "react";
import { Component, Fragment, useState, useReducer } from "react";
import { ISchema, ITable, IDatabase, IColumn, DatabaseType, GraphqlType } from "../../voodoo-shared/ISchema";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ConsoleSqlOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
    Form,
    Input,
    Button,
    Radio,
    Select,
    Cascader,
    DatePicker,
    InputNumber,
    TreeSelect,
    Switch,
    Col,
    Affix,
    Row,
    notification,
    message,
    Table,
    Tag,
    Popconfirm,
    Modal,
} from "antd";

import Column from "antd/lib/table/Column";
import _ from "lodash";
import { deepMerge } from './utils/deepMerge';
import { getDatabaseApiPrefixRules } from './validators/validators';

const { Option } = Select;

interface IState {
    dbEditorMode: "none" | "add" | "edit",
    //oldDb?: IDatabase,  // 
    newDb?: IDatabase,
}

export function DatabasesListPage() {
    const { t, i18n } = useTranslation();

    let query = gql`
    {
        databases
    }
`;
    const [state, setState] = useState<IState>({ dbEditorMode: "none" });

    const [databaseEditForm] = Form.useForm();
    const { loading, error, data, refetch } = useQuery<{ databases: IDatabase[] }>(query);

    const SAVE_DATABASE = gql`
        mutation ($db: JSON!) {
            save_database(database: $db)
        }
    `;
    const [saveDatabase] = useMutation(SAVE_DATABASE);


    const startAddDatabaseAction = () => {
        let newDb: IDatabase = {} as any;
        setState({ ...state, dbEditorMode: "add", newDb });
    }

    const startEditDatabaseAction = (db: IDatabase) => {
        setState({ ...state, dbEditorMode: "edit", newDb: db });
        setTimeout(() => {
            databaseEditForm.setFieldsValue(db);
        }, 1);

    }

    const saveDatabaseAction = async () => {
        await saveDatabase({ variables: { db: JSON.stringify(state.newDb) } });
        await refetch();
        setState({ ...state, dbEditorMode: "none" });
        console.log("database saved !!!");
    }

    const cancelDatabaseEditingAction = () => {
        setState({ ...state, dbEditorMode: "none", newDb: undefined, });

    }

    React.useEffect(() => {
        console.log("React.useEffect");
    });

    if (loading) return <div>"Loading..."</div>;
    if (error) return <div>`Error! ${error.message}`</div>;

    const groupHeaderFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 7,
            },
        },
    };

    return (

        <div style={{ maxWidth: 1200, margin: "20px 20px 0 20px" }}>
            {/* <Row>
                <Col span={24}>
                    <Affix offsetTop={10}>
                        <Button
                            type="default"
                            style={{ float: "right" }}
                            onClick={async () => {
                                console.log("save");
                            }}
                        >
                            обновить
                                </Button>
                    </Affix>
                </Col>
            </Row> */}
            <Row>
                <Col offset={0}><h2>{t("API_databases_list")}</h2></Col>
            </Row>
            <Table
                dataSource={data?.databases}
                rowKey="prefix"
                size="small"
                bordered
                pagination={false}
                title={() =>
                    <div style={{ minHeight: 26 }}>
                        <Button
                            style={{ float: "right" }}
                            size="small"
                            onClick={startAddDatabaseAction}
                        >
                            {"+ " + t("add_new_database")}
                        </Button>
                    </div>}
            >
                <Column title={t("api_name")} dataIndex="name" key="name" className="database-text-color" />
                <Column title={t("api_prefix")} dataIndex="prefix" key="prefix" className="database-text-color" />
                <Column title={t("description")} dataIndex="description" key="description" className="database-text-color" /> }
                <Column title={t("server_type")} dataIndex="type" key="package.name" />
                <Column
                    title={t("server_host")}
                    key="connection.host"
                    render={(text, record: IDatabase, index) => <span>{record.connection.host}:{record.connection.port}</span>}
                />
                <Column title={t("database_name")} dataIndex={["connection", "database"]} key="connection.database" />
                <Column title={t("login")} dataIndex={["connection", "username"]} key="connection.username" />
                <Column title={<span style={{ float: "right" }}>{t("actions")}</span>} key="operation"
                    render={(text, record: IDatabase, index) => {
                        return (
                            <Fragment>
                                <Popconfirm
                                    title={`Удалить таблицу "${record.name}"?`}
                                    okText="Да"
                                    cancelText="Нет"
                                    onConfirm={async () => {
                                        //await this.deleteColumn(record);
                                    }}>
                                    <Button size="small" type="link" danger style={{ float: "right", cursor: "pointer" }}>{t("delete")}</Button>
                                </Popconfirm>
                                <Button size="small" type="link" style={{ float: "right" }}
                                    onClick={() => {
                                        console.log("start-edit-database, record=", record);
                                        startEditDatabaseAction(record);
                                        //dispatch({ action: "start-edit-database", oldDb: record })
                                    }}
                                >{t("edit")}</Button>
                            </Fragment>
                        )
                    }}
                />
            </Table>

            {/* // =============================================== DATABASE FORM =================================================
                // =============================================== DATABASE FORM =================================================
                // =============================================== DATABASE FORM =================================================
                // =============================================== DATABASE FORM =================================================
                // =============================================== DATABASE FORM =================================================  */}
            <Modal
                width={700}
                visible={state.dbEditorMode != "none"}
                title={state.dbEditorMode == "add" ? t("Adding_new_database") : t("Editing_database")}
                destroyOnClose
                footer={[
                    <Button key="back" onClick={cancelDatabaseEditingAction}>
                        {t("Cancel")}
                    </Button>,
                    <Button key="submit" type="primary" onClick={saveDatabaseAction} >
                        {t("Save")}
                    </Button>,
                ]}
            >
                <Form

                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 15 }}
                    layout="horizontal"
                    size="small"
                    form={databaseEditForm}
                    //initialValues={state.newDb}
                    onValuesChange={(changedFields: any, allFields: any) => {
                        state.newDb = deepMerge(state.newDb, changedFields)
                    }}
                >
                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3>{t("API_GRAPHQL_info")}</h3>
                    </Form.Item>

                    <Form.Item name="name" label={t("api_name")}
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 400 }} disabled={state.dbEditorMode == "edit"} />
                    </Form.Item>

                    <Form.Item name="prefix" label={t("api_prefix")} rules={getDatabaseApiPrefixRules()}>
                        <Input style={{ maxWidth: 150 }} />
                    </Form.Item>


                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3>{t("connection_options")}</h3>
                    </Form.Item>

                    <Form.Item name="type" label={t("server_type")} >
                        <Select defaultValue="mssql" style={{ width: 120 }}>
                            <Option value="jack">Jack</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name={["connection", "host"]} label={t("server_host")}
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 400 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "port"]} label={t("server_port")}
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 100 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "username"]} label={t("login")}
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 250 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "password"]} label={t("password")}
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input.Password style={{ maxWidth: 250 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "host"]} label={t("database")}
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 400 }} />
                    </Form.Item>

                    <Form.Item {...groupHeaderFormItemLayout}>
                        <Button size="middle" shape="round" icon={<ConsoleSqlOutlined />}>{t("check_connection")}</Button>
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );


}
