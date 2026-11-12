import { CombinedGraphQLErrors } from '@apollo/client';

// Turns an error from Apollo into a short message we can show the user.
// - The server answered with errors (wrong password, invalid input...): show its messages.
//   Our server's formatError already words these for people, so they can be shown as they are.
// - Anything else means the server could not be reached: show a general message.
export function errorMessage(error) {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((e) => e.message).join(' ');
  }
  return 'Could not reach the server. Please check your connection and try again.';
}

// True if the server rejected the request with this error code, e.g. 'SERVICE_UNAVAILABLE'
// (codes are set by the server's formatError).
export function hasErrorCode(error, code) {
  return Boolean(error) && CombinedGraphQLErrors.is(error)
    && error.errors.some((e) => e.extensions?.code === code);
}
