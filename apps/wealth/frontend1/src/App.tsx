import { ApolloProvider } from '@apollo/client/react';
import { client } from './lib/apolloClient';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  return (
    <ApolloProvider client={client}>
      <DashboardPage />
    </ApolloProvider>
  );
}
