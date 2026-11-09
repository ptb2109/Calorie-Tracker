// Reads settings from environment variables (loaded from .env) and checks them once, at start-up.
// If something is missing or wrong, we stop straight away with a clear message ("fail fast")
// instead of crashing later with a confusing error.

const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];

export function loadConfig(env = process.env) {
  const missing = REQUIRED.filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing setting(s): ${missing.join(', ')}. ` +
      'Add them to server/.env (see server/.env.example).'
    );
  }

  // Environment variables are always text, so turn PORT into a number and check it.
  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be a whole number from 1 to 65535, but it is "${env.PORT}".`);
  }

  // A short secret is easy to guess, so refuse to start with one.
  if (env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long. See server/.env.example for how to generate one.');
  }

  // Object.freeze stops any other code from changing the settings by accident.
  return Object.freeze({
    port,
    mongoUri: env.MONGO_URI,
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
    usdaApiKey: env.USDA_API_KEY || 'DEMO_KEY', // OPTIONAL: falls back to USDA's shared demo key
  });
}
