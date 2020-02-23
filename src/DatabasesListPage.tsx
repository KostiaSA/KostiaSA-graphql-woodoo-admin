import * as React from 'react';
import { Component, Fragment, useState } from "react";
import { ISchema, ITable, IDatabase, IColumn, DatabaseType, GraphqlType } from "../../voodoo-shared/ISchema";
import { gql, useQuery } from '@apollo/client';
import * as _ from "lodash";

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

const { Option } = Select;

// import { call_api_graphql } from '../../../api/call_api_graphql';
// import Column from 'antd/lib/table/Column';

// import { FormInstance } from 'antd/lib/form';
// import { get_new_id } from '../../../utils/get_new_id';
// import { ISchemaTable } from '../../../schema/entities/ISchemaTable';
// import { getCurrentPackage } from '../../../admin/utils/getCurrentPackage';
// import { ISchemaTableColumn } from '../../../schema/entities/ISchemaTableColumn';
// import Head from 'next/head';
// import { DbGrid } from '../../../components/DbGrid';



interface IProps {
    data: any;
    // tableId?: string;
    // table?: ISchemaTable;
    // columns?: ISchemaTabCol[];
    error?: string;
}


interface IState {

}

export function DatabasesListPage() {

    let query = gql`
    {
        databases
    }
`;
    const { loading, error, data } = useQuery<{ databases: IDatabase[] }>(query);
    const [editedDb, setEditedDb] = useState<IDatabase>();

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
                            onClick={() => setEditedDb({} as any)
                            }

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
                                        setEditedDb(_.cloneDeep(record))
                                        //Router.push("/admin/table?tableId=" + record.id)
                                        //var win = window.open("/admin/table?tableId=" + record.id, '_blank', "left=50, top=50, width=1200,height=800");
                                        //win.focus();
                                        // this.schema_tablecol = _.cloneDeep(record);
                                        // if (this.columnEditForm)
                                        //     this.columnEditForm.setFieldsValue(this.schema_tablecol);
                                        //this.forceUpdate();
                                    }}
                                >изм.</Button>
                            </Fragment>
                        )
                    }}
                />
            </Table>
            {!editedDb ? null : (
                <Modal
                    visible={true}
                    title="Создание новой таблицы"
                    footer={[
                        <Button key="back" onClick={() => {
                            setEditedDb(undefined);
                        }}>
                            Отмена
                    </Button>,
                        <Button key="submit" type="primary" onClick={async () => {
                            // if (!(await isFormValidated(this.newTableForm)))
                            //     return;

                            // let query: string[] = [];
                            // query.push(await dbEmitInsUpdDelRowsMutations("schema_table", [], [this.newTable]));
                            // query.push(await dbEmitInsUpdDelRowsMutations("schema_tablecol", [], this.newTable.columns));
                            // await dbExecuteMutation(query.join("\n"));
                            // message.success(`Таблица "${this.newTable.name}" создана`);
                            // await dbExecuteMutation(`admin_synchronyze_schema_to_pg (tableId:"${this.newTable.id}")`);
                            // message.success(`Таблица "${this.newTable.name}" синхронизирована с базой данных`);

                            // this.newTableModalVisible = false;
                            // Router.push("/admin/table?tableId=" + this.newTable.id)
                        }} >
                            Создать базу данных
                    </Button>,
                    ]}
                >
                    <Form
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 15 }}
                        layout="horizontal"
                        initialValues={editedDb}
                        size="small"
                        onValuesChange={(changedFields, allFields) => {
                            //_.assign(this.newTable, changedFields);
                            //this.forceUpdate();
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

                    </Form>
                </Modal>)
            }
        </div>
    );


}

export class DatabasesListPage1 extends Component<IProps> {


    constructor(props: IProps) {
        super(props);
        // if (this.props.data) {
        //     console.log("this.props.data", this.props.data);
        //     this.init_schema_table = this.props.data.schema_table;
        //     this.schema_table = _.cloneDeep(this.props.data.schema_table) as Schema_Table;
        // }
    }

    componentDidMount() {
        //document.title = "Таблицы";
    }


    render() {

        const formItemLayout = {
            // labelCol: { span: 4 },
            // wrapperCol: { span: 10 },
        };

        const formTailLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 8, offset: 3 },
        };

        if (this.props.error) {
            return <div>ошибка: {this.props.error}</div>
        }
        else

            return (

                <div style={{ maxWidth: 1200, margin: "20px 20px 0 20px" }}>
                    <Row>
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
                    </Row>
                    <Row>
                        <Col offset={0}><h2>Список таблиц</h2></Col>
                    </Row>
                    <Table
                        dataSource={this.props.data.tables}
                        size="small"
                        bordered
                        pagination={false}
                        title={() =>
                            <div style={{ minHeight: 26 }}>
                                <Button
                                    style={{ float: "right" }}
                                    size="small"
                                    onClick={this.openNewTableModal.bind(this)}

                                >
                                    + добавить таблицу
                                        </Button>
                            </div>}
                    >
                        <Column title="id" dataIndex="id" key="id" />
                        <Column title="имя" dataIndex="name" key="name" />
                        <Column title="описание" dataIndex="description" key="description" />
                        <Column title="пакет" dataIndex={["package", "name"]} key="package.name" />
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
                                                //Router.push("/admin/table?tableId=" + record.id)
                                                //var win = window.open("/admin/table?tableId=" + record.id, '_blank', "left=50, top=50, width=1200,height=800");
                                                //win.focus();
                                                // this.schema_tablecol = _.cloneDeep(record);
                                                // if (this.columnEditForm)
                                                //     this.columnEditForm.setFieldsValue(this.schema_tablecol);
                                                this.forceUpdate();
                                            }}
                                        >изм.</Button>
                                    </Fragment>
                                )
                            }}
                        />

                    </Table>
                </div>
            );

    }



    // newTableModalVisible: boolean = false;
    // newTable: ISchemaTable;
    // newTableForm: FormInstance;

    openNewTableModal() {
        // this.newTableModalVisible = true;
        // let table_id = get_new_id();
        // //        console.log(table_id);
        // this.newTable = {
        //     id: table_id,
        //     name: "new_table_12665",
        //     package_id: getCurrentPackage(),
        //     columns: [
        //         {
        //             id: get_new_id(),
        //             name: "id",
        //             data_type: "pk",
        //             package_id: getCurrentPackage(),
        //             table_id: table_id,
        //             position: 0,
        //         }
        //     ]

        // } as any;
        this.forceUpdate();
    }

    renderNewTableModal() {


        // return (
        //     <Modal
        //         visible={this.newTableModalVisible}
        //         title="Создание новой таблицы"
        //         footer={[
        //             <Button key="back" onClick={() => {
        //                 this.newTableModalVisible = false;
        //                 this.forceUpdate();

        //             }}>
        //                 Отмена
        //             </Button>,
        //             <Button key="submit" type="primary" onClick={async () => {
        //                 // if (!(await isFormValidated(this.newTableForm)))
        //                 //     return;

        //                 // let query: string[] = [];
        //                 // query.push(await dbEmitInsUpdDelRowsMutations("schema_table", [], [this.newTable]));
        //                 // query.push(await dbEmitInsUpdDelRowsMutations("schema_tablecol", [], this.newTable.columns));
        //                 // await dbExecuteMutation(query.join("\n"));
        //                 // message.success(`Таблица "${this.newTable.name}" создана`);
        //                 // await dbExecuteMutation(`admin_synchronyze_schema_to_pg (tableId:"${this.newTable.id}")`);
        //                 // message.success(`Таблица "${this.newTable.name}" синхронизирована с базой данных`);

        //                 // this.newTableModalVisible = false;
        //                 // Router.push("/admin/table?tableId=" + this.newTable.id)
        //             }} >
        //                 Создать таблицу
        //             </Button>,
        //         ]}
        //     >
        //         <Form
        //             ref={(ref: any) => this.newTableForm = ref}
        //             labelCol={{ span: 7 }}
        //             wrapperCol={{ span: 15 }}
        //             layout="horizontal"
        //             initialValues={this.newTable}
        //             size="small"
        //             onValuesChange={(changedFields, allFields) => {
        //                 _.assign(this.newTable, changedFields);
        //                 this.forceUpdate();
        //             }}
        //         >
        //             <Form.Item name="id" label="id">
        //                 <Input style={{ maxWidth: 150 }} disabled />
        //             </Form.Item>

        //             <Form.Item name="name" label="имя таблицы" rules={getSchemaTableNameRules()}>
        //                 <Input style={{ maxWidth: 500 }} />
        //             </Form.Item>

        //         </Form>
        //     </Modal>
        // );
    }

}
