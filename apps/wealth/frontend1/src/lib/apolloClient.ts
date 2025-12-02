import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://127.0.0.1:4000/graphql';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: graphqlUrl
  }),
  cache: new InMemoryCache()
});
