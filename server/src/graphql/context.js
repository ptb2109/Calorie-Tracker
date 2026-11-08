import { userIdFromToken } from '../services/auth.js';

// Runs once per request and builds the "context" every resolver receives.
// It reads the login token from the request header:
//   Authorization: Bearer <token>
// A valid token gives the user's id; no token, or a fake, altered or expired one, means a guest (null).
export async function buildContext({ req, config }) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
  const userId = token ? userIdFromToken(token, config) : null;

  // config is passed on so the signup and login resolvers can create tokens with the secret.
  return { userId, config };
}
