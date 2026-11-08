// Pure calorie maths: no database, no network. Same input -> same output, so it is easy to test.

const NUTRIENTS = ['calories', 'protein', 'carbs', 'fat'];

// Round to 1 decimal place, e.g. 133.4999 -> 133.5
export function round1(n) {
  return Math.round(n * 10) / 10;
}

// Multiply every nutrient by the same factor. Missing values count as 0.
function scale(values, factor) {
  const result = {};
  for (const name of NUTRIENTS) {
    result[name] = round1((values[name] ?? 0) * factor);
  }
  return result;
}

// Food databases give nutrition per 100 g. 150 g of something with 89 kcal/100 g = 133.5 kcal.
export function scaleNutrients(per100g, grams) {
  return scale(per100g, grams / 100);
}

// An existing entry changes amount: 150 g -> 300 g doubles every nutrient.
export function rescaleNutrients(entry, newGrams) {
  return scale(entry, newGrams / entry.grams);
}

// Add up the nutrients of many entries.
export function sumNutrients(entries) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const entry of entries) {
    for (const name of NUTRIENTS) totals[name] += entry[name] ?? 0;
  }
  return scale(totals, 1); // just rounds each total
}
