import { User } from '../models/User.js';
import { NotFoundError } from './errors.js';

export async function getUser(userId) {
  return User.findById(userId);
}

// Only the goals that were sent are changed. Sending null for protein/carbs/fat clears that target.
export async function updateGoals(userId, input) {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');

  if (input.calories != null) user.goals.calories = input.calories;
  for (const name of ['protein', 'carbs', 'fat']) {
    if (name in input) user.goals[name] = input[name] ?? undefined;
  }

  await user.save(); // runs the model's validation rules (e.g. calories 500-10000)
  return user;
}
