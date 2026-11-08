import { loadConfig } from './config.js';
import { connectDB, disconnectDB } from './db.js';
import { createApp } from './app.js';

async function main() {
  // 1. Check the settings first; this throws if something is missing.
  const config = loadConfig();

  // 2. Connect to the database before accepting any requests.
  await connectDB(config.mongoUri);

  // 3. Only now build the app (including the GraphQL API) and start listening.
  const app = await createApp(config);
  const server = app.listen(config.port, () => {
    console.log(`Server ready at http://localhost:${config.port}`);
    console.log(`GraphQL playground at http://localhost:${config.port}/graphql`);
  });

  // 4. On Ctrl + C (SIGINT) or a stop request (SIGTERM), finish cleanly.
  async function shutdown(signal) {
    console.log(`${signal} received, shutting down...`);
    server.close();          // stop accepting new requests
    await disconnectDB();    // close the database connection
    process.exit(0);         // 0 = finished normally
  }
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('Server failed to start:', error.message);
  process.exit(1);           // non-zero = something went wrong
});
