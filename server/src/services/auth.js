import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuthenticationError, BadInputError } from './errors.js';

// How much work bcrypt does per hash: 2^12 rounds, about a quarter of a second.
// Barely noticeable for one login; very slow for someone trying millions of guesses.
const BCRYPT_ROUNDS = 12;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores anything after 72 bytes

// ---------- tokens (Idea 2) ----------

// Makes a signed token that says "this is user <id>" and expires after jwtExpiresIn.
function createToken(userId, config) {
  return jwt.sign({ sub: String(userId) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

// Returns the user id inside a valid token, or null if the token is fake, altered or expired.
export function userIdFromToken(token, config) {
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return payload.sub;
  } catch {
    return null;
  }
}

// ---------- sign up and log in (Idea 1 + Idea 2) ----------

export async function signup({ email, password, name }, config) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new BadInputError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new BadInputError(`Password must be at most ${MAX_PASSWORD_LENGTH} characters`);
  }

  // Store only the hash, never the password itself.
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await User.create({ email, name, passwordHash });
  } catch (error) {
    // 11000 = the unique email index refused a second account with the same email.
    if (error.code === 11000) throw new BadInputError('An account with this email already exists');
    throw error;
  }

  return { token: createToken(user._id, config), user };
}

export async function login({ email, password }, config) {
  // passwordHash is hidden by default (select: false in the model), so ask for it explicitly.
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');

  // Same message whether the email or the password was wrong, so nobody can use the login
  // form to find out which emails have accounts.
  const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));
  if (!passwordMatches) throw new AuthenticationError('Invalid email or password');

  return { token: createToken(user._id, config), user };
}
