import { getUser, updateGoals } from '../services/users.js';
import { getDailySummary } from '../services/summary.js';
import {
  addFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
  addExerciseEntry,
  deleteExerciseEntry,
} from '../services/entries.js';

// Resolvers connect each field in the schema to the code that answers it.
// Every resolver receives (parent, args, context):
//   args    - the arguments sent with the request, e.g. { date: "2026-11-08" }
//   context - shared per-request data; here, the id of the user making the request
// They stay thin on purpose: the real work happens in src/services/.
export const resolvers = {
  Query: {
    me: (_parent, _args, { userId }) => getUser(userId),
    dailySummary: (_parent, { date }, { userId }) => getDailySummary(userId, date),
  },

  Mutation: {
    updateGoals: (_parent, { input }, { userId }) => updateGoals(userId, input),
    addFoodEntry: (_parent, { input }, { userId }) => addFoodEntry(userId, input),
    updateFoodEntry: (_parent, { id, input }, { userId }) => updateFoodEntry(userId, id, input),
    deleteFoodEntry: (_parent, { id }, { userId }) => deleteFoodEntry(userId, id),
    addExerciseEntry: (_parent, { input }, { userId }) => addExerciseEntry(userId, input),
    deleteExerciseEntry: (_parent, { id }, { userId }) => deleteExerciseEntry(userId, id),
  },
};
