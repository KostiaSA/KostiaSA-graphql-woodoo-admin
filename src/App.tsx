import * as React from "react";
import logo from './logo.svg';
import Button from 'antd/es/button';
//import './App.css';
//import Layout from 'antd/es/layout';
import { Menu, Layout } from 'antd';
import { Component } from "react";
import SubMenu from "antd/lib/menu/SubMenu";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { Example } from "./Example";

import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { DatabasesListPage } from "./DatabasesListPage";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4001',
  })
});

export default class App extends Component<any> {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <Layout className="layout">
            <Layout.Header style={{ padding: 0 }}>
              {/* <div className="logo" style={
              {
                width: 150,
                height: 31,
                background: "rgba(255, 255, 255, 0.2)",
                margin: "16 24 16 0",
                float: "left",
              }
            } >
              <img src="logo.png" style={{
                width: 120,
                marginTop: -5,
                marginLeft: 6,
              }}></img>
            </div> */}
              <Menu
                // theme="dark"
                mode="horizontal"
                //defaultSelectedKeys={['2']}
                style={{ lineHeight: '64px' }}
              >
                <Menu.Item key="st22ing:1"><Link to="/databases">Базы данных</Link></Menu.Item>
                <Menu.Item key="st22i3ng:1"><Link to="/tables">Таблицы</Link></Menu.Item>
                <Menu.Item key="st22ieng:1"><Link to="/users">Users</Link></Menu.Item>
                {/* <SubMenu
                key="Документы"
                title={
                  <span className="submenu-title-wrapper">
                    
                    Документы1
                                        </span>
                }
              >
                <Menu.Item key="sett22ing:1">Приход на склад</Menu.Item>
                <Menu.Item key="setti2ng:2">Отгрузка со склада</Menu.Item>
              </SubMenu>
              <SubMenu
                key="Отчеты"
                title={
                  <span className="submenu-title-wrapper">
                    Отчеты
                                        </span>
                }
              >
                <Menu.Item key="set4ting:1">Остаток товара на складе</Menu.Item>
                <Menu.Item key="setti4ng:2">Движение товара за период</Menu.Item>
              </SubMenu>
              <SubMenu
                key="Справочники"
                title={
                  <span className="submenu-title-wrapper">
                    Справочники
                                        </span>
                }
              >
                <Menu.Item key="sett6ing:1">Товары</Menu.Item>
                <Menu.Item key="setti6ng:2">Партии товара</Menu.Item>
              </SubMenu> */}
              </Menu>
            </Layout.Header>
            <Layout.Content style={{ padding: '0 50px' }}>
              {/* <Breadcrumb style={{ margin: '16px 0' }}>
                                <Breadcrumb.Item>Home</Breadcrumb.Item>
                                <Breadcrumb.Item>List</Breadcrumb.Item>
                                <Breadcrumb.Item>App</Breadcrumb.Item>
                            </Breadcrumb> */}
              <div className="site-layout-content" style={{ padding: 24 }} >
                <Switch>
                  <Route path="/databases">
                    <DatabasesListPage></DatabasesListPage>
                  </Route>
                  <Route path="/tables">
                    <div>tables</div>
                  </Route>
                  <Route path="/about">
                    <div>about</div>
                  </Route>
                  <Route path="/users">
                    <div>users</div>
                  </Route>
                  <Route path="/">
                    <div>root</div>
                  </Route>
                </Switch>

              </div>
            </Layout.Content>
            <Layout.Footer style={{ textAlign: 'center' }}> Designed by Buhta ООО, ©2020 </Layout.Footer>
          </Layout>,
      </div>
      </ApolloProvider>
    );
  }
}

