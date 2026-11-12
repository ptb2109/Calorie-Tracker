// The meals the server accepts (its Meal enum), in the order they happen in a day.
export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];

// "breakfast" -> "Breakfast"
export function mealLabel(meal) {
  return meal.charAt(0).toUpperCase() + meal.slice(1);
}

// A sensible default meal for the current time of day.
export function mealForNow() {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

// Rounds to 1 decimal place, the same rule the server uses.
export function round1(n) {
  return Math.round(n * 10) / 10;
}
