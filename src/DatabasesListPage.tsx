import * as React from 'react';
import { Component, Fragment, useState, useReducer } from "react";
import { ISchema, ITable, IDatabase, IColumn, DatabaseType, GraphqlType } from "../../voodoo-shared/ISchema";
import { gql, useQuery } from '@apollo/client';


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
import { deepCloneAndMerge } from './utils/deepCloneAndMerge';
import _ from 'lodash';
import { stat } from 'fs';
import { FormInstance } from 'antd/lib/form';

const { Option } = Select;

interface IState {
    dbEditorMode: "none" | "add" | "edit",
    oldDb?: IDatabase,  // 
    newDb?: IDatabase,
    isNeedReloadDbList?: boolean
}

type IActon =
    | { action: "start-add-database" }
    | { action: "start-edit-database", oldDb: IDatabase }//, form: FormInstance }
    | { action: "database-fields-changed", changedFields: IDatabase }
    | { action: "save-database" }
    | { action: "cancel-database-editing" }


function reducer(state: IState, action: IActon): IState {
    switch (action.action) {
        case "start-add-database":
            return { ...state, dbEditorMode: "add", newDb: {} as any };

        case "start-edit-database":
            return { ...state, dbEditorMode: "edit", oldDb: action.oldDb, newDb: action.oldDb };


        case "database-fields-changed":
            state.newDb = { ...state.newDb, ...action.changedFields };
            return state;

        case "save-database":
            console.log("save-database", state.newDb)
            // let index = state.databases?.findIndex((db) => db.name == state.newDb?.name);
            // if (index == -1)
            //     throw Error("internal error in save-database");
            // state.databases[index] = state.newDb as any;

            return { ...state, dbEditorMode: "none", isNeedReloadDbList: true };

        case "cancel-database-editing":
            return { ...state, dbEditorMode: "none", oldDb: undefined, newDb: undefined, };

        default:
            throw new Error();
    }
}

export function DatabasesListPage() {

    let query = gql`
    {
        databases
    }
`;
    const [databaseEditForm] = Form.useForm();
    const { loading, error, data, refetch } = useQuery<{ databases: IDatabase[] }>(query);
    const [state, dispatch] = useReducer(reducer, { dbEditorMode: "none" } as any);


    //const [changedDbFields, setChangedDbFields] = useState<IDatabase>();
    //const [needResetFields, setneedResetFields] = useState(false);

    React.useEffect(() => {
        if (state.isNeedReloadDbList) {
            refetch();
            state.isNeedReloadDbList = false;
        }
        // setTimeout(() => {

        //     if (state.needResetFields) {
        //         databaseEditForm.setFieldsValue(state.newDb as any);
        //     }
        // }, 1);
        // if (state.needResetFields && databaseEditForm) {
        //     //state.needResetFields = false;
        //     //databaseEditForm.getFieldsValue();
        //     //console.log("getFieldsValue()", databaseEditForm.getFieldsValue());
        //     //databaseEditForm.setFieldsValue(state.newDb as any);
        //     //console.log("resetFields()");
        // }
        // // if (state.dbEditorMode == "none")
        // //     databaseEditForm.resetFields();
        console.log("React.useEffect");
    });

    console.log("render", state);

    if (loading) return <div>'Loading...'</div>;
    if (error) return <div>`Error! ${error.message}`</div>;

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
                            onClick={() => dispatch({ action: "start-add-database" })}
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
                                        dispatch({ action: "start-edit-database", oldDb: record })
                                        setTimeout(() => {
                                            databaseEditForm.setFieldsValue(record as any);
                                        }, 1);
                                    }}
                                >изм.</Button>
                            </Fragment>
                        )
                    }}
                />
            </Table>
            {state.dbEditorMode == "222none" as any ? null : (
                /*  // =============================================== DATABASE FORM =================================================
                    // =============================================== DATABASE FORM =================================================
                    // =============================================== DATABASE FORM =================================================
                    // =============================================== DATABASE FORM =================================================
                    // =============================================== DATABASE FORM ================================================= */
                <Modal
                    visible={state.dbEditorMode != "none"}
                    title="Создание новой таблицы"
                    footer={[
                        <Button key="back" onClick={() => {
                            dispatch({ action: "cancel-database-editing" })
                        }}>
                            Отмена
                        </Button>,
                        <Button key="submit" type="primary" onClick={async () => {
                            dispatch({ action: "save-database" })
                        }} >
                            Сохранить
                    </Button>,
                    ]}
                >
                    <Form

                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 15 }}
                        layout="horizontal"
                        //initialValues={state.newDb}
                        size="small"
                        form={databaseEditForm}
                        onValuesChange={(changedFields: any, allFields: any) => {
                            //_.merge(state.newDb || {}, allFields);
                            //console.log(_.merge(changedDbFields || {}, allFields))
                            dispatch({ action: "database-fields-changed", changedFields })
                        }}
                    >
                        <Form.Item name="prefix" label="prefix">
                            <Input style={{ maxWidth: 150 }} disabled />
                        </Form.Item>

                        <Form.Item name="name" label="имя базы"
                        //    rules={getSchemaTableNameRules()}
                        >
                            <Input style={{ maxWidth: 500 }} />
                        </Form.Item>
                        <Form.Item name={["connection", "host"]} label="адрес сервера (url)"
                        //    rules={getSchemaTableNameRules()}
                        >
                            <Input style={{ maxWidth: 500 }} />
                        </Form.Item>

                    </Form>
                </Modal>
            )
            }
            }
        </div>
    );


}
