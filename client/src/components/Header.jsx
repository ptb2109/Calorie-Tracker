import { useApolloClient } from '@apollo/client/react';
import { clearToken } from '../apollo.js';

// The top bar for logged-in users: app name, who you are, and a log-out button.
export function Header({ user }) {
  const client = useApolloClient();

  async function logOut() {
    clearToken();             // forget the token, so later requests are sent as a guest
    await client.clearStore(); // forget all cached data, so nothing of this user stays on screen
    // Ask "who am I?" again: now the answer is null, so the App shows the log-in form.
    await client.refetchQueries({ include: ['Me'] });
  }

  return (
    <header className="app-header">
      <h1>Calorie Tracker</h1>
      <div className="row">
        <span className="muted">{user.name}</span>
        <button type="button" className="secondary" onClick={logOut}>
          Log out
        </button>
      </div>
    </header>
  );
}
