import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { isDBConnected } from './db.js';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import { buildContext } from './graphql/context.js';
import { formatError } from './graphql/formatError.js';

// Builds and returns the Express app, without starting it.
// Keeping "build" separate from "listen" lets tests use the app without a real port.
export async function createApp(config) {
  const app = express();

  // Parse JSON request bodies into req.body (GraphQL requests are JSON).
  app.use(express.json());

  // Health check: is the server up, and can it reach the database?
  app.get('/health', (req, res) => {
    const dbConnected = isDBConnected();
    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? 'ok' : 'degraded',
      database: dbConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    });
  });

  // GraphQL API at /graphql. Apollo must finish starting before it can handle requests.
  const apollo = new ApolloServer({ typeDefs, resolvers, formatError });
  await apollo.start();
  app.use('/graphql', expressMiddleware(apollo, {
    context: ({ req }) => buildContext({ req, config }),
  }));
  

  return app;
}
