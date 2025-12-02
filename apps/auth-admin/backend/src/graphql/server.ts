import { ApolloServer, HeaderMap } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { typeDefs } from './schema';
import { createResolvers } from './resolvers';
import { pool } from '../drizzle/client';
import runMigrations from '../drizzle/migrate';

// Apply DB migrations before starting the GraphQL server
await runMigrations();

// Start Apollo once at module load time (Node 20+ supports top-level await)
export const server = new ApolloServer({
  typeDefs,
  resolvers: createResolvers(pool),
  plugins: [
    // Enable GraphQL landing page (Playground-like) in local development
    ApolloServerPluginLandingPageLocalDefault({ footer: false }),
  ],
});

await server.start();

export { HeaderMap };
