import { signup, login } from '../services/auth.js';
import { AuthenticationError } from '../services/errors.js';
import { getUser, updateGoals } from '../services/users.js';
import { getDailySummary, getHistory } from '../services/summary.js';
import { searchFoods } from '../services/foodSearch.js';
import {
  addFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
  addExerciseEntry,
  deleteExerciseEntry,
} from '../services/entries.js';

// Gate for operations that need a logged-in user: returns their id, or stops the request
// with an UNAUTHENTICATED error. Every protected resolver calls it first.
function requireUser(context) {
  if (!context.userId) throw new AuthenticationError();
  return context.userId;
}

// Resolvers connect each field in the schema to the code that answers it.
// Every resolver receives (parent, args, context):
//   args    - the arguments sent with the request, e.g. { date: "2026-11-08" }
//   context - shared per-request data from context.js: { userId, config }
// They stay thin on purpose: the real work happens in src/services/.
export const resolvers = {
  Query: {
    // Guests get null instead of an error, so the app can simply ask "am I logged in?"
    me: (_parent, _args, { userId }) => (userId ? getUser(userId) : null),
    dailySummary: (_parent, { date }, context) => getDailySummary(requireUser(context), date),
    history: (_parent, { endDate, days }, context) => getHistory(requireUser(context), endDate, days),
    // Logged-in users only, so anonymous visitors can't use up our shared USDA allowance.
    searchFoods: (_parent, { query }, context) => {
      requireUser(context);
      return searchFoods(query, context.config);
    },
  },

  Mutation: {
    // Open to everyone: these are how you get a token in the first place.
    signup: (_parent, { input }, { config }) => signup(input, config),
    login: (_parent, { email, password }, { config }) => login({ email, password }, config),

    // Logged-in users only.
    updateGoals: (_parent, { input }, context) => updateGoals(requireUser(context), input),
    addFoodEntry: (_parent, { input }, context) => addFoodEntry(requireUser(context), input),
    updateFoodEntry: (_parent, { id, input }, context) => updateFoodEntry(requireUser(context), id, input),
    deleteFoodEntry: (_parent, { id }, context) => deleteFoodEntry(requireUser(context), id),
    addExerciseEntry: (_parent, { input }, context) => addExerciseEntry(requireUser(context), input),
    deleteExerciseEntry: (_parent, { id }, context) => deleteExerciseEntry(requireUser(context), id),
  },
};
