import * as React from "react";
import { useTranslation } from "react-i18next";
import { useObserver } from "mobx-react-lite";
import { useParams, useHistory } from "react-router-dom";
import { Tabs, Table, Popconfirm, Button, Checkbox, Form, Switch, Input, Modal } from "antd";
import { gql, useQuery } from "@apollo/client";
import Column from "antd/lib/table/Column";
import { IDatabase, ITable, IColumn, IRefColumn } from "../../../voodoo-shared/ISchema";
import { Fragment, useState, ReactNode } from 'react';
import Search from "antd/lib/input/Search";
import Highlighter from "react-highlight-words";
import { apolloExecute } from "../apolloExecute";
import { translitToGraphQL } from "../utils/translitToGraphQL";
import { sqlTypeToGraphQLType } from "../utils/sqlTypeToGraphQLType";
import { useLocalStorage } from "react-use";
import { getStringHash } from "../utils/getStringHash";
import { deepMerge } from "../utils/deepMerge";
import { getDatabaseApiPrefixRules } from "../validators/validators";
import { isFormValidatedOk } from "../utils/isFormValidatedOk";

const { TabPane } = Tabs;

type NativeTableRecord = { schema_name: string, table_name: string };
type INativeTableColumn = { name: string, type: string };

function getTableApiDisplayName(db: IDatabase, table: ITable): string {
    if (db.prefix && db.prefix !== "")
        return db.prefix + "_" + (table.object_alias || "?");
    else
        return table.object_alias || "?";
}

export function TableApiPage() {
    const { t, i18n } = useTranslation();

    const history = useHistory();

    let { db_name, table_schema, table_name } = useParams();

    let localStoragePrefix = "DatabaseApiPage:" + db_name + ":" + table_schema + ":" + table_name + ":";

    let query = gql`
    query ($db_name:String, $table_schema:String, $table_name:String) {
        database(db_name:$db_name)
        table(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
        table_ref_tables(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
        native_table_columns(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
    }`;

    const query_result = useQuery<{ database: IDatabase, table: ITable, table_ref_tables: ITable[], native_table_columns: INativeTableColumn[] }>(query, { variables: { db_name, table_schema, table_name } });

    let columnsByName: { [name: string]: IColumn } = {};

    if (query_result.data) {
        for (let column of query_result.data?.table.columns) {
            let key = column.name;
            columnsByName[key] = column;
        }
    }
    console.log("columnsByName", columnsByName);

    let isColumn_off = (col_name: string): boolean => {
        let column = columnsByName[col_name];
        if (!column)
            return true;
        else
            return !!column.disabled;
    }

    const [table_form] = Form.useForm();
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


    // ********* FILTERS *************
    const [filterOnlyActive, setFilterOnlyActive] = useLocalStorage<boolean>(getStringHash(localStoragePrefix + "filterOnlyActive"), false);
    const [filterByName, setFilterByName] = useLocalStorage<string>(getStringHash(localStoragePrefix + "filterByName"), "");

    let native_columns_filtered: INativeTableColumn[] = [];
    if (query_result && query_result.data) {
        let filterByName_lowered = (filterByName || "").toLowerCase();
        native_columns_filtered = query_result.data.native_table_columns.filter((native_column: INativeTableColumn) => {
            let res = true;
            if (filterOnlyActive && isColumn_off(native_column.name))
                res = false;
            if (typeof filterByName == "string" && filterByName !== "") {
                let column = columnsByName[native_column.name];
                let conditon_1 = (native_column.name).toLowerCase().indexOf(filterByName_lowered) > -1;
                let conditon_2 = column && column.alias && column.alias.toLowerCase().indexOf(filterByName_lowered) > -1;
                if (!conditon_1 && !conditon_2) {
                    res = false;
                }

            }
            return res;
        });
    }

    const [activeTabKey, setActiveTabKey] = useLocalStorage<string>(getStringHash(localStoragePrefix + "activeTabKey"), "Columns");

    let selectTable = async (db_name?: String, table_schema?: String, table_name?: String): Promise<ITable> => {
        let query = gql`
                query ($db_name:String, $table_schema:String, $table_name:String) {
                    table(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
            }`;

        return (await apolloExecute(query, { db_name, table_schema, table_name })).table;
    }

    let upsertTable = async (table: ITable) => {
        let query = gql`
                    mutation ($table: JSON!) {
                        save_table(table: $table)
                    }
                `;
        await apolloExecute(query, { table: JSON.stringify(table) })
    }

    const saveChanges = async () => {
        if (await isFormValidatedOk(table_form)) {
            let table_to_update: ITable = await selectTable(db_name, table_schema, table_name);
            // let query = gql`
            //     query ($db_name:String, $table_schema:String, $table_name:String) {
            //         table(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
            // }`;

            // table_to_update = (await apolloExecute(query, { db_name: db_name, table_schema, table_name })).table;
            table_to_update = deepMerge(table_to_update, changedFields)

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

    // ********* ACTIONS *************
    let setColumn_on_off = async (native_column: INativeTableColumn, on_off_value: boolean) => {

        // reload table 
        let table_to_update: ITable = await selectTable(db_name, table_schema, table_name);

        // let table_to_update: ITable;
        // let query = gql`
        //         query ($db_name:String, $table_schema:String, $table_name:String) {
        //             table(db_name:$db_name, table_schema:$table_schema, table_name:$table_name)
        //     }`;

        // table_to_update = (await apolloExecute(query, { db_name: db_name, table_schema, table_name })).table;
        let column = table_to_update.columns.find((c) => c.name === native_column.name);// columnsByName[native_column.name];

        if (on_off_value) {
            if (column) {
                column.disabled = false;
            }
            else {
                column = {
                    name: native_column.name,
                    alias: translitToGraphQL(native_column.name),
                    type: sqlTypeToGraphQLType(native_column.type),
                    description: native_column.name,
                    sql_type: native_column.type,
                    //ref_db?: string;
                    //ref_table?: string;
                    //ref_columns?: { column: string, ref_column: string }[];

                } as IColumn
                table_to_update.columns.push(column);
                columnsByName[native_column.name] = column;
            }
        }
        else {
            if (column) {
                column.disabled = true;
            }
        }

        await upsertTable(table_to_update);
        await query_result.refetch();
    }

    let set_object_relationship_on_off = async (column: IColumn, on_off_value: boolean) => {

        // reload table 
        let table_to_update: ITable = await selectTable(db_name, table_schema, table_name);
        let table_column = table_to_update.columns.find((col => col.name === column.name));
        if (table_column) {
            table_column.disabled = !on_off_value;
            await upsertTable(table_to_update);
            await query_result.refetch();
        }
        else {
            throw new Error("internal error in 'set_object_relationship_on_off'");
        }
    }

    let getColumnsCountStr = (): string => {
        if (query_result.data) {
            let count = query_result.data?.native_table_columns.length;
            if (count > 0)
                return ` (${count})`;
        }
        return "";
    }

    let getObjectRelationshipsCountStr = (): string => {
        if (query_result.data) {
            let count = getObjectRelationships().length;
            if (count > 0)
                return ` (${count})`;
        }
        return "";
    }

    let getObjectRelationships = (): IColumn[] => {
        if (query_result.data) {
            return query_result.data?.table.columns.filter((col: IColumn) => typeof col.ref_db === "string" && col.ref_db.length > 0);
        }
        return [];
    }

    let getRefTableApiName = (db_name?: string, table_schema?: string, table_name?: string): string => {
        if (query_result.data) {
            for (let ref_table of query_result.data?.table_ref_tables) {
                if (ref_table.dbname === db_name && ref_table.dbo === table_schema && ref_table.name === table_name)
                    return ref_table.object_alias || ref_table.name;
            }
        }
        return "error";
    }


    return useObserver(() => {
        if (!query_result.data)
            return null;

        return (
            <div style={{ maxWidth: 1200, margin: "20px 20px 0 20px" }}>
                <h2>
                    {t("Table_API")}: <span style={{ fontSize: 18, color: "gray" }}>{db_name}.</span>{table_schema}.{table_name}
                    &nbsp;=>&nbsp;<span className="api-name-text-color">{query_result.data?.table.object_alias}</span>,
                    &nbsp;<span className="api-name-text-color">{query_result.data?.table.array_alias}</span>
                </h2>
                <Tabs activeKey={activeTabKey} animated={false} onChange={(key) => setActiveTabKey(key)}>
                    <TabPane tab={t("Columns") + getColumnsCountStr()} key="Columns" forceRender>
                        <Form layout="inline">
                            <Form.Item label={t("search_by_name")}>
                                <Search
                                    allowClear
                                    size="small"
                                    placeholder={t("input_search_text")}
                                    onSearch={(value: string) => setFilterByName(value)}
                                    style={{ width: 250 }}
                                />
                            </Form.Item>
                            <Form.Item label={t("only_api_on")}>
                                <Switch size="small" checked={filterOnlyActive} onChange={(enable) => setFilterOnlyActive(enable)} />
                            </Form.Item>
                        </Form>
                        <br></br>
                        <Table
                            dataSource={native_columns_filtered}
                            rowKey="prefix"
                            size="small"
                            bordered
                            pagination={{ pageSize: 75 }}
                        >

                            <Column title={t("table_column")} dataIndex="table_name" key="table" className="table-text-color"
                                render={(text: string, record: INativeTableColumn) => {
                                    return (
                                        <Highlighter
                                            highlightClassName="highlight-text"
                                            searchWords={[filterByName]}
                                            autoEscape={true}
                                            textToHighlight={record.name}
                                        />
                                    )
                                }}
                            />
                            <Column title={t("sql_type")} dataIndex="table_name" key="table" className="table-text-color"
                                render={(text: string, record: INativeTableColumn) => {
                                    return (
                                        <span>{record.type}</span>
                                    )
                                }}
                            />
                            <Column title={<span>{t("api_on_off")}</span>} key="api_on_off" align="center"
                                render={(text, record: INativeTableColumn, index) => {
                                    return (
                                        <Checkbox
                                            checked={!isColumn_off(record.name)}
                                            onChange={(e) => setColumn_on_off(record, e.target.checked)}
                                        >

                                        </Checkbox>
                                    )
                                }}
                            />
                            <Column title={t("api_name")} dataIndex="api_name" key="api_name" className="api-name-text-color"
                                render={(text: string, record: INativeTableColumn) => {
                                    if (!isColumn_off(record.name)) {
                                        let col = columnsByName[record.name];
                                        return (
                                            <Highlighter
                                                highlightClassName="highlight-text"
                                                searchWords={[filterByName]}
                                                autoEscape={true}
                                                textToHighlight={col.alias}
                                            />
                                        )
                                        //return query_result.data?.database.prefix + "_" + record.schema_name + "_" + record.table_name;
                                    }
                                    else
                                        return "";
                                }}
                            />
                            <Column title={<span style={{ float: "right" }}>{t("actions")}</span>} key="operation"
                                render={(text, record: INativeTableColumn, index) => {
                                    if (!isColumn_off(record.name))
                                        return (
                                            <Fragment>
                                                <Button size="small" type="link" style={{ float: "right" }}
                                                    // className={`form-title-color-add`}
                                                    onClick={() => {
                                                        //history.push("/database-api/" + encodeURIComponent(record.name));
                                                        history.push("/table-column-api/" +
                                                            encodeURIComponent(db_name || "_") + "/" +
                                                            encodeURIComponent(table_schema || "_") + "/" +
                                                            encodeURIComponent(table_name || "_") + "/" +
                                                            encodeURIComponent(record.name || "_"));

                                                    }}
                                                >{t("column_setup")}
                                                </Button>

                                            </Fragment>
                                        )
                                    else
                                        return null;
                                }}
                            />

                        </Table>
                    </TabPane>

                    <TabPane tab={t("Object_relationships") + getObjectRelationshipsCountStr()} key="Object_relationships" forceRender>
                        <Table
                            dataSource={getObjectRelationships()}
                            rowKey="prefix"
                            size="small"
                            bordered
                            pagination={{ pageSize: 75 }}
                            title={() =>
                                <div style={{ minHeight: 26 }}>
                                    <Button
                                        style={{ float: "right" }}
                                        size="small"
                                        //onClick={startAddDatabaseAction}
                                        className={`form-title-color-add`}
                                    >
                                        {"+ " + t("add_new_relationship")}
                                    </Button>
                                </div>}
                        >

                            {/* <Column title={t("table_column")} dataIndex="table_name" key="table" className="table-text-color"
                                render={(text: string, record: IColumn) => {
                                    return (
                                        <Highlighter
                                            highlightClassName="highlight-text"
                                            searchWords={[filterByName]}
                                            autoEscape={true}
                                            textToHighlight={record.name}
                                        />
                                    )
                                }}
                            />
                            <Column title={t("sql_type")} dataIndex="table_name" key="table" className="table-text-color"
                                render={(text: string, record: IColumn) => {
                                    return (
                                        <span>#{typeof record.ref_db}#</span>
                                    )
                                }}
                            /> */}
                            <Column title={t("api_name")} dataIndex="api_name" key="api_name" className="api-name-text-color"
                                render={(text: string, record: IColumn) => {
                                    return (
                                        <span>{record.alias}</span>
                                    )
                                }}
                            />
                            <Column title={<span>{t("api_on_off")}</span>} key="api_on_off" align="center"
                                render={(text, record: IColumn, index) => {
                                    return (
                                        <Checkbox
                                            checked={!record.disabled}
                                            onChange={(e) => set_object_relationship_on_off(record, e.target.checked)}
                                        >

                                        </Checkbox>
                                    )
                                }}
                            />
                            <Column title={t("ref_database")} dataIndex="ref_database" key="ref_database"
                                render={(text: string, record: IColumn) => {
                                    let style = record.disabled ? { color: "silver" } : {};
                                    return (
                                        <span style={style}>{record.ref_db}</span>
                                    )
                                }}
                            />
                            <Column title={t("ref_table")} dataIndex="ref_table" key="ref_table"
                                render={(text: string, record: IColumn) => {
                                    let style = record.disabled ? { color: "silver" } : {};
                                    return (
                                        <Fragment>
                                            <span style={style}>{record.ref_table}</span>
                                            <span style={style} className="api-name-text-color">
                                                &nbsp;( {getRefTableApiName(record.ref_db, record.ref_schema, record.ref_table)} )
                                            </span>
                                        </Fragment>
                                    )
                                }}
                            />
                            <Column title={t("ref_columns")} key="ref_columns"
                                render={(text: string, record: IColumn) => {

                                    let refTableApiName = getRefTableApiName(record.ref_db, record.ref_schema, record.ref_table);
                                    let renderRefCol = (ref_col: IRefColumn): ReactNode => {
                                        let style = record.disabled ? { color: "silver" } : {};
                                        return (
                                            <span style={style}>
                                                {table_name}.{ref_col.column} => {record.ref_table}.{ref_col.ref_column}
                                            </span>)
                                    }

                                    if (record.ref_columns?.length === 0)
                                        return null
                                    else if (record.ref_columns?.length === 1)
                                        return renderRefCol(record.ref_columns[0])
                                    else
                                        return (
                                            <table style={{ border: "none", padding: 0 }}>
                                                <tbody>
                                                    {record.ref_columns?.map((ref_col: IRefColumn) => {
                                                        return (
                                                            <tr style={{ border: "none", padding: 0 }}>
                                                                <td style={{ border: "none", padding: 0 }}>{table_name}.{ref_col.column}</td>
                                                                <td style={{ border: "none", padding: 0 }}>=></td>
                                                                <td style={{ border: "none", padding: 0 }}>{record.ref_table}.{ref_col.ref_column}</td></tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        )
                                }}
                            />
                            <Column title={<span style={{ float: "right" }}>{t("actions")}</span>} key="operation"
                                render={(text, record: INativeTableColumn, index) => {
                                    if (!isColumn_off(record.name))
                                        return (
                                            <Fragment>
                                                <Button size="small" type="link" style={{ float: "right" }}
                                                    // className={`form-title-color-add`}
                                                    onClick={() => {
                                                        //history.push("/database-api/" + encodeURIComponent(record.name));
                                                        history.push("/table-column-api/" +
                                                            encodeURIComponent(db_name || "_") + "/" +
                                                            encodeURIComponent(table_schema || "_") + "/" +
                                                            encodeURIComponent(table_name || "_") + "/" +
                                                            encodeURIComponent(record.name || "_"));

                                                    }}
                                                >{t("column_setup")}
                                                </Button>

                                            </Fragment>
                                        )
                                    else
                                        return null;
                                }}
                            />

                        </Table>
                    </TabPane>

                    <TabPane tab={t("API_names")} key="API_names" forceRender>
                        <Form

                            labelCol={{ span: 5 }}
                            wrapperCol={{ span: 15 }}
                            layout="horizontal"
                            size="small"
                            form={table_form}
                            initialValues={query_result.data?.table}
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
                            <Form.Item name="object_alias" label={t("single_object_api_name")} rules={getDatabaseApiPrefixRules()}>
                                <Input autoComplete="off" style={{ maxWidth: 350 }} className="api-name-text-color" />
                            </Form.Item>

                            <Form.Item name="array_alias" label={t("objects_array_api_name")} rules={getDatabaseApiPrefixRules()}>
                                <Input autoComplete="off" style={{ maxWidth: 350 }} className="api-name-text-color" />
                            </Form.Item>

                            <Form.Item name="description" label={t("description")}
                                rules={[{ max: 255, message: t("max_length_exceeded", { name: t("description"), length: 255 }) }]}

                            >
                                <Input autoComplete="off" style={{ maxWidth: 500 }} />
                            </Form.Item>


                            <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
                                <Button key="submit" size="middle" type="primary" style={{ marginLeft: 8 }} onClick={saveChanges} disabled={!changedFields}>
                                    {t("Save")}
                                </Button>
                            </Form.Item>
                        </Form>
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