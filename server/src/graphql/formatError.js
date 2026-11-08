import mongoose from 'mongoose';
import { unwrapResolverError } from '@apollo/server/errors';
import { NotFoundError, BadInputError, AuthenticationError } from '../services/errors.js';

// Decides what an error looks like to the client. Expected problems get a clear message and a
// code the frontend can check. Unexpected ones are logged here and hidden from the client,
// because their details (file paths, database messages) are useless to users and help attackers.
export function formatError(formattedError, error) {
  const original = unwrapResolverError(error);

  if (original instanceof mongoose.Error.ValidationError) {
    // One message per invalid field, e.g. { grams: "Amount must be at least 1 g" }
    const fields = {};
    for (const e of Object.values(original.errors)) fields[e.path] = e.message;
    return {
      ...formattedError,
      message: Object.values(fields).join('; '),
      extensions: { code: 'BAD_USER_INPUT', fields },
    };
  }

  if (original instanceof BadInputError) {
    return { ...formattedError, message: original.message, extensions: { code: 'BAD_USER_INPUT' } };
  }

  if (original instanceof NotFoundError) {
    return { ...formattedError, message: original.message, extensions: { code: 'NOT_FOUND' } };
  }

  if (original instanceof AuthenticationError) {
    return { ...formattedError, message: original.message, extensions: { code: 'UNAUTHENTICATED' } };
  }

  // Errors GraphQL raised itself (a typo in the query, a missing argument) are safe to show as they are.
  if (formattedError.extensions?.code !== 'INTERNAL_SERVER_ERROR') {
    return formattedError;
  }

  console.error('Unexpected error:', original);
  return {
    ...formattedError,
    message: 'Something went wrong on the server',
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  };
}
