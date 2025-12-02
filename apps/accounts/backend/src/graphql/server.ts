import { createServer } from 'http';
import { createHandler } from 'graphql-http/lib/use/http';
import { schema } from './schema';

// Simple HTTP server for GraphQL. Default port 4000 unless PORT is set.
const port = parseInt(process.env.PORT ?? '4000', 10);

const handler = createHandler({ schema });

const server = createServer((req, res) => {
  if (req.url?.startsWith('/graphql')) {
    return handler(req, res);
  }
  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(port, () => {
  console.log(`GraphQL endpoint ready at http://localhost:${port}/graphql`);
});
