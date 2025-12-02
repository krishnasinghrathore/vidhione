import { api } from 'encore.dev/api';
import { createHandler } from 'graphql-http/lib/use/node';
import { schema } from './graphql/schema';

const handler = createHandler({ schema });

// Expose GraphQL at /graphql via Encore (POST)
export const graphqlApiPost = api.raw({ method: 'POST', path: '/graphql', expose: true }, async (req, res) => {
  return handler(req, res);
});

// Allow GET for simple queries/introspection
export const graphqlApiGet = api.raw({ method: 'GET', path: '/graphql', expose: true }, async (req, res) => {
  return handler(req, res);
});

// GraphiQL UI at /graphiql (GraphiQL 2.x)
const graphiqlHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>GraphiQL</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/graphiql@2.4.1/graphiql.min.css" />
    <style>
      body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
      #root { height: 100%; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/graphiql@2.4.1/graphiql.min.js"></script>
    <script>
      const fetcher = GraphiQL.createFetcher({ url: '/graphql' });
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        React.createElement(GraphiQL, {
          fetcher,
          defaultQuery: '{\\n  ledger(limit:5){ voucherNo voucherDate ledger drAmt crAmt }\\n}\\n'
        })
      );
    </script>
  </body>
</html>`;

export const graphiql = api.raw({ method: 'GET', path: '/graphiql', expose: true }, async (_req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(graphiqlHtml);
});
