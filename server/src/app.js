import express from 'express';
import { isDBConnected } from './db.js';

// Builds and returns the Express app, without starting it.
// Keeping "build" separate from "listen" lets tests use the app without a real port.
export function createApp() {
  const app = express();

  // Parse JSON request bodies into req.body.
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

  return app;
}
