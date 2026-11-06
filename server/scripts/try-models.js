// Playground for Step 3: saves good data, tries bad data, reads it back, then cleans up.
// Run it with: docker compose exec server npm run try:models

import { loadConfig } from '../src/config.js';
import { connectDB, disconnectDB } from '../src/db.js';
import { User } from '../src/models/User.js';
import { FoodEntry } from '../src/models/FoodEntry.js';
import { ExerciseEntry } from '../src/models/ExerciseEntry.js';

const EMAIL = 'playground@example.com';
const DAY = '2026-11-06';

function heading(text) {
  console.log(`\n=== ${text} ===`);
}

// Shows why Mongoose refused to save something.
function explain(error) {
  if (error.name === 'ValidationError') {
    Object.values(error.errors).forEach((e) => console.log(`  ✗ ${e.path}: ${e.message}`));
  } else if (error.code === 11000) {
    console.log(`  ✗ Duplicate: ${JSON.stringify(error.keyValue)} already exists`);
  } else {
    throw error; // something unexpected; let it crash loudly
  }
}

async function main() {
  const config = loadConfig();
  await connectDB(config.mongoUri);
  // Wait until indexes (such as the unique email) exist before testing them.
  await Promise.all([User.init(), FoodEntry.init(), ExerciseEntry.init()]);

  // Remove anything left over from an earlier run.
  const old = await User.findOne({ email: EMAIL });
  if (old) {
    await FoodEntry.deleteMany({ user: old._id });
    await ExerciseEntry.deleteMany({ user: old._id });
    await User.deleteOne({ _id: old._id });
  }

  heading('1. Save a valid user');
  const user = await User.create({
    email: '  Playground@Example.com ',
    passwordHash: 'not-a-real-hash-yet',
    name: 'Playground User',
  });
  console.log('  ✓ Saved:', { id: String(user._id), email: user.email, goals: user.goals.toObject() });
  console.log('    (email was trimmed and lower-cased; default calorie goal was filled in)');

  heading('2. Try a second account with the same email');
  try {
    await User.create({ email: EMAIL, passwordHash: 'x', name: 'Copycat' });
  } catch (error) {
    explain(error);
  }

  heading('3. Save valid food and exercise entries');
  await FoodEntry.create([
    { user: user._id, date: DAY, meal: 'breakfast', foodName: 'Banana, raw', grams: 150, calories: 133.5, protein: 1.6, carbs: 34.3, fat: 0.5 },
    { user: user._id, date: DAY, meal: 'lunch', foodName: 'Chicken rice', grams: 350, calories: 607, protein: 25, carbs: 75, fat: 23 },
  ]);
  await ExerciseEntry.create({ user: user._id, date: DAY, activity: 'Running', minutes: 30, caloriesBurned: 300 });
  console.log('  ✓ Saved 2 food entries and 1 exercise entry');

  heading('4. Try an entry with several mistakes');
  try {
    await FoodEntry.create({ user: user._id, date: '2026-02-30', meal: 'brunch', foodName: '', grams: 0, calories: -50 });
  } catch (error) {
    explain(error);
  }

  heading("5. Read back the day's entries and add them up");
  const foods = await FoodEntry.find({ user: user._id, date: DAY }).sort({ createdAt: 1 });
  const workouts = await ExerciseEntry.find({ user: user._id, date: DAY });
  foods.forEach((f) => console.log(`  ${f.meal.padEnd(9)} ${f.foodName.padEnd(14)} ${f.grams} g  ${f.calories} kcal`));
  const eaten = foods.reduce((sum, f) => sum + f.calories, 0);
  const burned = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  console.log(`  Eaten ${eaten} − burned ${burned} = net ${eaten - burned} kcal (goal ${user.goals.calories})`);

  heading('6. The password hash stays hidden unless asked for');
  const plain = await User.findById(user._id);
  const withHash = await User.findById(user._id).select('+passwordHash');
  console.log('  Normal query  → passwordHash:', plain.passwordHash);
  console.log('  Asked for it  → passwordHash:', withHash.passwordHash);

  heading('7. Clean up');
  await FoodEntry.deleteMany({ user: user._id });
  await ExerciseEntry.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });
  console.log('  ✓ Playground data deleted');
}

main()
  .catch((error) => {
    console.error('Playground failed:', error);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
