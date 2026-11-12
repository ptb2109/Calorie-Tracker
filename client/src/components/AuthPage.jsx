import { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION, SIGNUP_MUTATION } from '../graphql/operations.js';
import { errorMessage } from '../graphql/errorMessage.js';
import { saveToken } from '../apollo.js';

// The log-in / sign-up form shown to guests. One form, two modes.
export function AuthPage() {
  // What this component remembers between redraws ("state").
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const client = useApolloClient();
  const [login, loginState] = useMutation(LOGIN_MUTATION);
  const [signup, signupState] = useMutation(SIGNUP_MUTATION);

  const isSignup = mode === 'signup';
  const busy = loginState.loading || signupState.loading;

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's default "reload the page" on submit
    setError(null);
    try {
      const { data } = isSignup
        ? await signup({ variables: { input: { email, password, name } } })
        : await login({ variables: { email, password } });
      const { token } = isSignup ? data.signup : data.login;

      saveToken(token);
      // Forget anything cached so far and re-run the active queries (such as "me")
      // with the new token. The App then sees a logged-in user and swaps this form out.
      await client.resetStore();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup');
    setError(null);
  }

  return (
    <section className="card">
      <h2>{isSignup ? 'Create an account' : 'Log in'}</h2>

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              autoComplete="name"
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isSignup ? 8 : undefined}
            maxLength={72}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" disabled={busy}>
          {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>
      </form>

      <p className="muted">
        {isSignup ? 'Already have an account?' : 'New here?'}{' '}
        <button type="button" className="secondary" onClick={switchMode}>
          {isSignup ? 'Log in instead' : 'Create an account'}
        </button>
      </p>
    </section>
  );
}
