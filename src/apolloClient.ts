import { ApolloClient, InMemoryCache, HttpLink, DefaultOptions } from '@apollo/client';
import { useCacheErrors } from 'antd/lib/form/util';


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



