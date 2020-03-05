import * as React from "react";
import { Fragment, useState, useContext, } from "react";
import { IDatabase, } from "../../voodoo-shared/ISchema";
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
import { deepMerge } from './utils/deepMerge';
import { getDatabaseApiPrefixRules, getDatabaseApiNameRules } from './validators/validators';
import { DATABASE_TYPES, GET_DATABASE_DEFAULT_PORT } from './const';
import { apolloClient, doQuery } from "./apolloClient";
import { AppStateContext } from "./App";
import { appState } from "./AppState";
import { useObserver } from "mobx-react-lite";

const { Option } = Select;

interface IState {
    dbEditorMode: "none" | "add" | "edit",
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

    const DELETE_DATABASE = gql`
        mutation ($db_name: String) {
            delete_database(db_name: $db_name)
        }
    `;
    const [deleteDatabase] = useMutation(DELETE_DATABASE);

    const startAddDatabaseAction = () => {
        let db: IDatabase = {
            name: "db1",
            prefix: "sql1",
            type: "SQL Server",
            description: "",
            connection: {
                host: "localhost",
                port: GET_DATABASE_DEFAULT_PORT("SQL Server"),
                username: "sa",
                password: "",
                database: "",
            }
        };
        setState({ ...state, dbEditorMode: "add", newDb: db });
        setTimeout(() => {
            databaseEditForm.setFieldsValue(db);
        }, 1);
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
        setDbState({});
        console.log("database saved !!!");
    }

    const deleteDatabaseAction = async (db_name: string) => {
        await deleteDatabase({ variables: { db_name: db_name } });
        await refetch();
        setDbState({});
        console.log("database deleted !!!");
    }

    const cancelDatabaseEditingAction = () => {
        setState({ ...state, dbEditorMode: "none", newDb: undefined, });

    }

    React.useEffect(() => {
        //console.log("React.useEffect");
    });


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

    const [dbState, setDbState] = useState<{ [db_name: string]: string }>({});

    return useObserver(() => {

        if (loading) return <div>"Loading..."</div>;
        if (error) return <div>`Error! ${error.message}`</div>;

        if (data) {
            let needForceUpdate = false;
            for (let db of data.databases) {
                if (!dbState[db.name]) {
                    dbState[db.name] = t("checking...");
                    needForceUpdate = true;
                    setTimeout(async () => {
                        let query = gql`
                                        query ($db_type: String, $connection: JSON) {
                                            check_database_connection(db_type: $db_type, connection:$connection )
                                        }
                                    `;
                        let res = await doQuery(query, { db_type: db.type, connection: JSON.stringify(db.connection) });
                        if (res.check_database_connection == "Ok")
                            dbState[db.name] = t("connected");
                        else
                            dbState[db.name] = t("error");
                        setDbState({ ...dbState });
                    }, 1);
                }
            }
            if (needForceUpdate)
                setDbState({ ...dbState });
        }

        return (
            <div style={{ maxWidth: 1200, margin: "20px 20px 0 20px" }}>
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
                                className={`form-title-color-add`}
                            >
                                {"+ " + t("add_new_database")}
                            </Button>
                        </div>}
                >
                    <Column title={t("state")} dataIndex="state" key="state"
                        render={(text: string, record: IDatabase) => {
                            if (dbState[record.name] == t("connected"))
                                return <span style={{ color: "#52c41a" }}>{dbState[record.name]}</span>
                            else if (dbState[record.name] == t("error"))
                                return <span style={{ color: "#f5222d" }}>{dbState[record.name]}</span>
                            else
                                return <span style={{ color: "gray" }}>{dbState[record.name]}</span>
                        }}
                    />
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
                                        title={t("delete_database?", { name: record.name })}
                                        okText={t("Yes")}
                                        cancelText={t("No")}
                                        onConfirm={async () => {
                                            await deleteDatabaseAction(record.name);
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
                                            startEditDatabaseAction(record);
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
                    title={<span className={`form-title-color-${state.dbEditorMode}`}>{state.dbEditorMode == "add" ? t("Adding_new_database") : t("Editing_database")}</span>}
                    destroyOnClose
                    footer={[
                        <Button key="back" onClick={cancelDatabaseEditingAction} disabled={appState.ui_disabled}>
                            {t("Cancel")}
                        </Button>,
                        <Button key="submit" type="primary" onClick={saveDatabaseAction} disabled={appState.ui_disabled}>
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
                        onValuesChange={(changedFields: any, allFields: any) => {
                            state.newDb = deepMerge(state.newDb, changedFields)
                        }}
                    >
                        <Form.Item {...groupHeaderFormItemLayout}>
                            <h3 className={`form-title-color-${state.dbEditorMode}`}>{t("API_GRAPHQL_info")}</h3>
                        </Form.Item>

                        <Form.Item name="name" label={t("api_name")} rules={getDatabaseApiNameRules()}
                        //    rules={getSchemaTableNameRules()}
                        >
                            <Input autoComplete="off" style={{ maxWidth: 400 }} disabled={state.dbEditorMode == "edit"} />
                        </Form.Item>

                        <Form.Item name="prefix" label={t("api_prefix")} rules={getDatabaseApiPrefixRules()}>
                            <Input autoComplete="off" style={{ maxWidth: 150 }} />
                        </Form.Item>

                        <Form.Item name="description" label={t("description")}
                            rules={[{ max: 255, message: t("max_length_exceeded", { name: t("description"), length: 255 }) }]}

                        >
                            <Input autoComplete="off" style={{ maxWidth: 400 }} />
                        </Form.Item>

                        <Form.Item {...groupHeaderFormItemLayout}>
                            <h3 className={`form-title-color-${state.dbEditorMode}`}>{t("connection_options")}</h3>
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

                        <Form.Item {...groupHeaderFormItemLayout}>
                            <Button size="middle" shape="round" icon={<ConsoleSqlOutlined />} disabled={appState.ui_disabled}
                                onClick={async () => {
                                    let query = gql`
                                        query ($db_type: String, $connection: JSON) {
                                            check_database_connection(db_type: $db_type, connection:$connection )
                                        }
                                    `;
                                    let res = await doQuery(query, { db_type: state.newDb?.type, connection: JSON.stringify(state.newDb?.connection) });
                                    if (res.check_database_connection == "Ok")
                                        Modal.success({ title: state.newDb?.connection.database, content: t("connection Ok"), centered: true });
                                    else
                                        Modal.error({ title: state.newDb?.connection.database, content: res.check_database_connection, centered: true });
                                }}
                            >
                                {t("check_connection")}
                            </Button>
                        </Form.Item>

                    </Form>
                </Modal>
            </div>

        )
    });


}
