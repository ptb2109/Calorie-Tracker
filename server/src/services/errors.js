// Error types for the business logic. They describe WHAT went wrong in plain terms and know
// nothing about GraphQL; src/graphql/formatError.js turns them into API responses.

export class NotFoundError extends Error {
  constructor(what) {
    super(`${what} not found`);
    this.name = 'NotFoundError';
  }
}

export class BadInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadInputError';
  }
}

// The request needs a logged-in user, or the email/password were wrong.
export class AuthenticationError extends Error {
  constructor(message = 'You must be logged in') {
    super(message);
    this.name = 'AuthenticationError';
  }
}
