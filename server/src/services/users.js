import { User } from '../models/User.js';
import { NotFoundError } from './errors.js';

// TEMPORARY for Step 4: until login exists (Step 5), every request acts as this one demo user.
const DEMO_EMAIL = 'demo@example.com';

export async function getDemoUserId() {
  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    try {
      user = await User.create({ email: DEMO_EMAIL, name: 'Demo User', passwordHash: 'no-login-yet' });
    } catch (error) {
      // Two requests at the same moment may both try to create it; the second gets a duplicate error.
      if (error.code !== 11000) throw error;
      user = await User.findOne({ email: DEMO_EMAIL });
    }
  }
  return user._id;
}

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
