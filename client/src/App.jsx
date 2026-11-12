import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from './graphql/operations.js';
import { errorMessage } from './graphql/errorMessage.js';
import { AuthPage } from './components/AuthPage.jsx';
import { Header } from './components/Header.jsx';
import { Dashboard } from './components/Dashboard.jsx';

// The top-level component: asks who is logged in, then shows either the app or the log-in form.
export function App() {
  const { data, loading, error } = useQuery(ME_QUERY);

  // Logged in: the header and the main screen.
  if (data?.me) {
    return (
      <main>
        <Header user={data.me} />
        <Dashboard user={data.me} />
      </main>
    );
  }

  // Not logged in (or still finding out).
  function renderGuestContent() {
    if (loading && !data) return <p className="muted">Loading…</p>;
    if (error) return <p className="card error" role="alert">{errorMessage(error)}</p>;
    return <AuthPage />;
  }

  return (
    <main>
      <h1>Calorie Tracker</h1>
      {renderGuestContent()}
    </main>
  );
}
