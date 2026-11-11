import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

// The question we ask the server, in GraphQL (the same query you ran in Sandbox).
const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
    }
  }
`;

// The top-level component: everything on the page lives inside it.
export function App() {
  // Ask the server who is logged in. Apollo sends the request (with the token, if we have one)
  // and gives us three things: loading (still waiting?), error (did it fail?), data (the answer).
  const { data, loading, error } = useQuery(ME_QUERY);

  return (
    <main>
      <h1>Calorie Tracker</h1>

      {loading && <p>Checking who you are…</p>}

      {error && <p role="alert">Could not reach the server: {error.message}</p>}

      {data && (data.me
        ? <p>Logged in as {data.me.name} ({data.me.email})</p>
        : <p>Not logged in.</p>
      )}
    </main>
  );
}
