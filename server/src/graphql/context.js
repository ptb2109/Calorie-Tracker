import { getDemoUserId } from '../services/users.js';

// Runs once per request and builds the "context" every resolver receives.
// TEMPORARY for Step 4: everyone is the demo user. Step 5 replaces this with real login,
// and because resolvers only ever read context.userId, none of them will need to change.
export async function buildContext() {
  return { userId: await getDemoUserId() };
}
