import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

// ---------- the login token ----------
// The token from signup/login is kept in the browser's localStorage, so you stay logged in
// after a page refresh. These three functions are the only code that touches it.
const TOKEN_KEY = 'calorieTrackerToken';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------- the Apollo Client ----------
// Each request passes through a chain of "links", like stations on an assembly line:
//   authLink (adds the token header)  →  httpLink (sends the request to the server)

// Sends GraphQL requests to /graphql on this same site (Vite passes them on to the server).
const httpLink = new HttpLink({ uri: '/graphql' });

// Before every request: if we have a token, add  Authorization: Bearer <token>
const authLink = new SetContextLink((prevContext) => {
  const token = getToken();
  if (!token) return {}; // logged out: send the request as a guest
  return {
    headers: {
      ...prevContext.headers,
      authorization: `Bearer ${token}`,
    },
  };
});

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(), // remembers query results, so screens don't fetch the same data twice
});