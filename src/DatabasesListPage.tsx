import * as React from 'react';
import { Component, Fragment, useState, useReducer } from "react";
import { ISchema, ITable, IDatabase, IColumn, DatabaseType, GraphqlType } from "../../voodoo-shared/ISchema";
import { gql, useQuery, useMutation } from '@apollo/client';
import { ConsoleSqlOutlined } from '@ant-design/icons';

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
} from 'antd';

import Column from 'antd/lib/table/Column';
import _ from 'lodash';
const deepmerge = require('deepmerge')

const { Option } = Select;

interface IState {
    dbEditorMode: "none" | "add" | "edit",
    //oldDb?: IDatabase,  // 
    newDb?: IDatabase,
}

export function DatabasesListPage() {

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

    if (loading) return <div>'Loading...'</div>;
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
                <Col offset={0}><h2>Список баз данных</h2></Col>
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
                            + добавить базу даных
                        </Button>
                    </div>}
            >
                <Column title="api-имя" dataIndex="name" key="name" className="database-text-color" />
                <Column title="api-префикс" dataIndex="prefix" key="prefix" className="database-text-color" />
                <Column title="описание" dataIndex="description" key="description" className="database-text-color" /> }
                <Column title="тип сервера" dataIndex="type" key="package.name" />
                <Column
                    title="адрес сервера (URL)"
                    key="connection.host"
                    render={(text, record: IDatabase, index) => <span>{record.connection.host}:{record.connection.port}</span>}
                />
                <Column title="имя базы данных" dataIndex={["connection", "database"]} key="connection.database" />
                <Column title="логин" dataIndex={["connection", "username"]} key="connection.username" />
                <Column title={<span style={{ float: "right" }}>действия</span>} key="operation"
                    render={(text, record: IDatabase, index) => {
                        return (
                            <Fragment>
                                <Popconfirm
                                    title={`Удалить таблицу '${record.name}'?`}
                                    okText="Да"
                                    cancelText="Нет"
                                    onConfirm={async () => {
                                        //await this.deleteColumn(record);
                                    }}>
                                    <Button size="small" type="link" danger style={{ float: "right", cursor: "pointer" }}>удал.</Button>
                                </Popconfirm>
                                <Button size="small" type="link" style={{ float: "right" }}
                                    onClick={() => {
                                        console.log("start-edit-database, record=", record);
                                        startEditDatabaseAction(record);
                                        //dispatch({ action: "start-edit-database", oldDb: record })
                                    }}
                                >изм.</Button>
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
                title="Создание новой базы данных"
                destroyOnClose
                footer={[
                    <Button key="back" onClick={cancelDatabaseEditingAction}>
                        Отмена
                        </Button>,
                    <Button key="submit" type="primary" onClick={saveDatabaseAction} >
                        Сохранить
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
                        state.newDb = deepmerge(state.newDb, changedFields)
                    }}
                >
                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3>информация для API GRAPHQL</h3>
                    </Form.Item>

                    <Form.Item name="name" label="имя базы"
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 400 }} disabled={state.dbEditorMode == "edit"} />
                    </Form.Item>

                    <Form.Item name="prefix" label="prefix" >
                        <Input style={{ maxWidth: 150 }} />
                    </Form.Item>


                    <Form.Item {...groupHeaderFormItemLayout}>
                        <h3>параметры подключения</h3>
                    </Form.Item>

                    <Form.Item name="type" label="тип сервера БД" >
                        <Select defaultValue="mssql" style={{ width: 120 }}>
                            <Option value="jack">Jack</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name={["connection", "host"]} label="адрес сервера (url)"
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 400 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "port"]} label="порт сервера"
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 100 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "username"]} label="логин"
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 250 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "password"]} label="пароль"
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input.Password style={{ maxWidth: 250 }} />
                    </Form.Item>

                    <Form.Item name={["connection", "host"]} label="база данных"
                    //    rules={getSchemaTableNameRules()}
                    >
                        <Input style={{ maxWidth: 400 }} />
                    </Form.Item>

                    <Form.Item {...groupHeaderFormItemLayout}>
                        <Button size="middle" shape="round" icon={<ConsoleSqlOutlined />}>проверка подключения</Button>
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );


}
