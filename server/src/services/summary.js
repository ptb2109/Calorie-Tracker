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

// ---------- history (for the weekly chart) ----------

const MAX_HISTORY_DAYS = 31;

// "2026-11-13" moved by a number of days, e.g. shiftDate("2026-11-01", -1) -> "2026-10-31".
// Done in UTC so the server's own time zone can never shift the date.
export function shiftDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Calories eaten, burned and net for each of the `days` days ending on endDate (oldest first).
// The client sends endDate because "today" depends on the user's time zone.
export async function getHistory(userId, endDate, days) {
  if (!isValidDateString(endDate)) {
    throw new BadInputError(`"${endDate}" is not a real date in YYYY-MM-DD format`);
  }
  if (!Number.isInteger(days) || days < 1 || days > MAX_HISTORY_DAYS) {
    throw new BadInputError(`Days must be a whole number from 1 to ${MAX_HISTORY_DAYS}`);
  }

  const dates = [];
  for (let i = days - 1; i >= 0; i--) dates.push(shiftDate(endDate, -i));

  // One query per collection for the whole range (using the { user, date } index),
  // rather than one query per day. Only the fields we need are loaded.
  const [user, foodEntries, exerciseEntries] = await Promise.all([
    User.findById(userId),
    FoodEntry.find({ user: userId, date: { $in: dates } }, 'date calories'),
    ExerciseEntry.find({ user: userId, date: { $in: dates } }, 'date caloriesBurned'),
  ]);
  if (!user) throw new NotFoundError('User');

  return dates.map((date) => {
    const eaten = round1(foodEntries.filter((e) => e.date === date).reduce((sum, e) => sum + e.calories, 0));
    const burned = round1(exerciseEntries.filter((e) => e.date === date).reduce((sum, e) => sum + e.caloriesBurned, 0));
    return { date, eaten, burned, net: round1(eaten - burned), goal: user.goals.calories };
  });
}
