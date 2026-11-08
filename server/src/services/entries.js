import mongoose from 'mongoose';
import { FoodEntry } from '../models/FoodEntry.js';
import { ExerciseEntry } from '../models/ExerciseEntry.js';
import { NotFoundError } from './errors.js';
import { scaleNutrients, rescaleNutrients } from './nutrition.js';

// Every lookup includes the user's id, so nobody can read, change or delete someone else's entry
// just by guessing its id. If it isn't theirs, it simply "doesn't exist".
async function findOwned(Model, label, userId, id) {
  if (!mongoose.isValidObjectId(id)) throw new NotFoundError(label);
  const entry = await Model.findOne({ _id: id, user: userId });
  if (!entry) throw new NotFoundError(label);
  return entry;
}

async function deleteOwned(Model, label, userId, id) {
  if (!mongoose.isValidObjectId(id)) throw new NotFoundError(label);
  const result = await Model.deleteOne({ _id: id, user: userId });
  if (result.deletedCount === 0) throw new NotFoundError(label);
  return true;
}

// ---------- food ----------

// The client sends nutrition per 100 g plus the grams eaten; the server does the maths,
// so the numbers are calculated the same way for every client.
export async function addFoodEntry(userId, input) {
  const { per100g, ...fields } = input;
  return FoodEntry.create({
    ...fields,
    ...scaleNutrients(per100g, input.grams),
    user: userId, // set last, from the server's side, never from the client
  });
}

// Lets the user move an entry to another meal or change the amount.
export async function updateFoodEntry(userId, id, input) {
  const entry = await findOwned(FoodEntry, 'Food entry', userId, id);

  if (input.meal != null) entry.meal = input.meal;
  if (input.grams != null && input.grams !== entry.grams) {
    Object.assign(entry, rescaleNutrients(entry, input.grams));
    entry.grams = input.grams;
  }

  await entry.save();
  return entry;
}

export function deleteFoodEntry(userId, id) {
  return deleteOwned(FoodEntry, 'Food entry', userId, id);
}

// ---------- exercise ----------

export async function addExerciseEntry(userId, input) {
  return ExerciseEntry.create({ ...input, user: userId });
}

export function deleteExerciseEntry(userId, id) {
  return deleteOwned(ExerciseEntry, 'Exercise entry', userId, id);
}
