import { BadInputError, ExternalServiceError } from './errors.js';
import { round1 } from './nutrition.js';

// The adapter between our app and the USDA FoodData Central database.
// It is the only file that knows USDA's address, request format and reply format;
// everything else in the app only sees our own simple Food shape.

const SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const TIMEOUT_MS = 8000;      // give up if USDA hasn't answered within 8 seconds
const MAX_RESULTS = 10;       // how many foods we send back to the client

// USDA's own id numbers for the nutrients we need (all values are per 100 g).
const PROTEIN_ID = 1003;
const FAT_ID = 1004;
const CARBS_ID = 1005;

const UNAVAILABLE = 'Food search is unavailable right now. You can still enter the food manually.';

export async function searchFoods(query, config) {
  // 1. Check our own input before spending a request on it.
  const text = query.trim();
  if (text.length < 2) throw new BadInputError('Type at least 2 characters to search');
  if (text.length > 100) throw new BadInputError('Search must be 100 characters or fewer');

  // 2. Ask USDA. A network failure or timeout lands in the catch block.
  let response;
  try {
    response = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.usdaApiKey, // in a header, so the key never appears in a URL
      },
      body: JSON.stringify({ query: text, pageSize: 25 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error('USDA search could not be completed:', error.message);
    throw new ExternalServiceError(UNAVAILABLE);
  }

  // 3. USDA answered, but with an error status (wrong key, too many requests, outage...).
  if (!response.ok) {
    console.error(`USDA search returned status ${response.status}`);
    if (response.status === 429) {
      throw new ExternalServiceError('Too many food searches right now. Please wait a moment, or enter the food manually.');
    }
    throw new ExternalServiceError(UNAVAILABLE);
  }

  // 4. Read the reply and check it has the shape we expect.
  const data = await response.json().catch(() => null);
  if (!data || !Array.isArray(data.foods)) {
    console.error('USDA search returned an unexpected reply');
    throw new ExternalServiceError(UNAVAILABLE);
  }

  // 5. Translate each USDA item into our Food shape, drop unusable ones, keep the first few.
  return data.foods.map(toFood).filter(Boolean).slice(0, MAX_RESULTS);
}

// Turns one USDA search result into our Food shape, or null if it lacks what we need.
function toFood(item) {
  const nutrients = Array.isArray(item.foodNutrients) ? item.foodNutrients : [];

  // Energy appears in kcal and in kJ, under a few different ids, so look for "Energy" in KCAL.
  const energy = nutrients.find(
    (n) => String(n.nutrientName).startsWith('Energy') && String(n.unitName).toUpperCase() === 'KCAL'
  );

  // Grams of one nutrient, or 0 if it is missing or not a sensible number.
  const grams = (id) => {
    const value = nutrients.find((n) => n.nutrientId === id)?.value;
    return typeof value === 'number' && value >= 0 ? round1(value) : 0;
  };

  // Without an id, a name and a calorie value, the food is no use to us.
  if (!Number.isInteger(item.fdcId) || typeof item.description !== 'string') return null;
  if (!energy || typeof energy.value !== 'number' || energy.value < 0) return null;

  return {
    fdcId: item.fdcId,
    name: item.description,
    brand: item.brandOwner || item.brandName || null,
    dataType: item.dataType || '',
    per100g: {
      calories: round1(energy.value),
      protein: grams(PROTEIN_ID),
      carbs: grams(CARBS_ID),
      fat: grams(FAT_ID),
    },
  };
}
