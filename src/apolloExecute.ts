import { DocumentNode } from '@apollo/client';
import { appState } from './AppState';
import { Modal } from 'antd';
import { apolloClient } from './apolloClient';

export async function apolloExecute(query: DocumentNode, variables: any, dont_disable_ui: boolean = false): Promise<any> {
    try {
        if (!dont_disable_ui)
            appState.ui_disabled = true;
        let res = await apolloClient.query({ query, variables });
        if (res.errors && res.errors.length > 0) {
            throw new Error(res.errors[0].message);
        }
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
