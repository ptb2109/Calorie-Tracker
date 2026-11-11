import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './apollo.js';
import { App } from './App.jsx';

// Start React: find the empty <div id="root"> in index.html and draw the App inside it.
// ApolloProvider makes the Apollo Client available to every component inside it.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
);