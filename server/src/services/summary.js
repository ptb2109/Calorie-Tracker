import { User } from '../models/User.js';
import { FoodEntry } from '../models/FoodEntry.js';
import { ExerciseEntry } from '../models/ExerciseEntry.js';
import { isValidDateString } from '../models/shared.js';
import { BadInputError, NotFoundError } from './errors.js';
import { round1, sumNutrients } from './nutrition.js';

// Everything the daily screen needs, in one go: entries, totals and how they compare with the goal.
export async function getDailySummary(userId, date) {
  if (!isValidDateString(date)) {
    throw new BadInputError(`"${date}" is not a real date in YYYY-MM-DD format`);
  }

  // Three independent lookups, run at the same time.
  const [user, foodEntries, exerciseEntries] = await Promise.all([
    User.findById(userId),
    FoodEntry.find({ user: userId, date }).sort({ createdAt: 1 }),
    ExerciseEntry.find({ user: userId, date }).sort({ createdAt: 1 }),
  ]);
  if (!user) throw new NotFoundError('User');

  const eaten = sumNutrients(foodEntries);
  const burned = round1(exerciseEntries.reduce((sum, e) => sum + e.caloriesBurned, 0));
  const net = round1(eaten.calories - burned);
  const goal = user.goals.calories;

  return {
    date,
    goal,
    eaten,
    burned,
    net,
    remaining: round1(goal - net),
    foodEntries,
    exerciseEntries,
  };
}
