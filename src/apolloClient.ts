import { ApolloClient, InMemoryCache, HttpLink, DocumentNode, DefaultOptions } from '@apollo/client';
import { appState } from './AppState';
import { Modal } from 'antd';


const defaultOptions: DefaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
}

export const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
    link: new HttpLink({
        uri: `${window.location.protocol}//${window.location.hostname}:${Number.parseInt(window.location.port) + 1}`,
    })
});


export async function doQuery(query: DocumentNode, variables: any, dont_disable_ui: boolean = false): Promise<any> {

    try {
        if (!dont_disable_ui)
            appState.ui_disabled = true;
        let res = await apolloClient.query({ query, variables });
        return res.data;
    }
    catch (e) {
        Modal.error({ title: e.toString(), centered: true });
        throw e;
    }
    finally {
        if (!dont_disable_ui)
            appState.ui_disabled = false;
    }

}