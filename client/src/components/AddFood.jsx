import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { ADD_FOOD_ENTRY_MUTATION, REFRESH_AFTER_CHANGE, SEARCH_FOODS_QUERY } from '../graphql/operations.js';
import { errorMessage, hasErrorCode } from '../graphql/errorMessage.js';
import { MEALS, mealForNow, mealLabel } from '../meals.js';

const EMPTY_MANUAL = { name: '', calories: '', protein: '', carbs: '', fat: '' };

// Log a food: either search the USDA database and pick a result, or type it in by hand.
export function AddFood({ date }) {
  const [mode, setMode] = useState('search'); // 'search' or 'manual'
  const [searchText, setSearchText] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState(''); // what was last searched for
  const [selected, setSelected] = useState(null); // the search result the user picked
  const [manual, setManual] = useState(EMPTY_MANUAL);
  const [grams, setGrams] = useState('100');
  const [meal, setMeal] = useState(mealForNow);
  const [formError, setFormError] = useState(null);
  const [message, setMessage] = useState(null);

  // Runs only when there is something to search for (skip: true means "don't run yet").
  const search = useQuery(SEARCH_FOODS_QUERY, {
    variables: { query: submittedSearch },
    skip: !submittedSearch,
  });
  const [addFoodEntry, addState] = useMutation(ADD_FOOD_ENTRY_MUTATION, { refetchQueries: REFRESH_AFTER_CHANGE });

  const searchUnavailable = hasErrorCode(search.error, 'SERVICE_UNAVAILABLE');

  function switchMode(newMode) {
    setMode(newMode);
    setSelected(null);
    setFormError(null);
    setMessage(null);
  }

  function handleSearch(event) {
    event.preventDefault();
    setSelected(null);
    setMessage(null);
    setSubmittedSearch(searchText.trim());
  }

  // Returns a function that updates one field of the manual form, e.g. updateManual('calories').
  function updateManual(field) {
    return (event) => setManual((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleAdd(event) {
    event.preventDefault();
    setFormError(null);
    setMessage(null);
    const amount = Number(grams);

    let input;
    if (mode === 'search') {
      if (!selected) {
        setFormError('Pick a food from the search results first.');
        return;
      }
      // Copy only the four numbers: the cached result also carries Apollo's "__typename",
      // which the server's NutrientsInput does not accept.
      const { calories, protein, carbs, fat } = selected.per100g;
      input = {
        date,
        meal,
        grams: amount,
        foodName: selected.name,
        fdcId: selected.fdcId,
        per100g: { calories, protein, carbs, fat },
      };
    } else {
      // The user types totals for the amount eaten; the server expects values per 100 g.
      const toPer100g = (value) => (value === '' ? 0 : (Number(value) / amount) * 100);
      input = {
        date,
        meal,
        grams: amount,
        foodName: manual.name.trim(),
        per100g: {
          calories: toPer100g(manual.calories),
          protein: toPer100g(manual.protein),
          carbs: toPer100g(manual.carbs),
          fat: toPer100g(manual.fat),
        },
      };
    }

    try {
      await addFoodEntry({ variables: { input } });
      setMessage(`Added ${input.foodName} to ${mealLabel(meal).toLowerCase()}.`);
      setSelected(null);
      setManual(EMPTY_MANUAL);
    } catch (err) {
      setFormError(errorMessage(err));
    }
  }

  return (
    <section className="card">
      <h2>Add food</h2>

      <div className="row tabs">
        <button
          type="button"
          className={mode === 'search' ? '' : 'secondary'}
          aria-pressed={mode === 'search'}
          onClick={() => switchMode('search')}
        >
          Search foods
        </button>
        <button
          type="button"
          className={mode === 'manual' ? '' : 'secondary'}
          aria-pressed={mode === 'manual'}
          onClick={() => switchMode('manual')}
        >
          Enter manually
        </button>
      </div>

      {mode === 'search' && (
        <>
          <form className="row" onSubmit={handleSearch}>
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="e.g. banana, brown rice"
              minLength={2}
              maxLength={100}
              required
              aria-label="Food to search for"
            />
            <button type="submit" disabled={search.loading}>
              {search.loading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {search.error && (
            <p className="error" role="alert">
              {errorMessage(search.error)}{' '}
              {searchUnavailable && (
                <button type="button" className="secondary" onClick={() => switchMode('manual')}>
                  Enter it manually
                </button>
              )}
            </p>
          )}

          {search.data && search.data.searchFoods.length === 0 && (
            <p className="muted">No foods found. Try another word, or enter it manually.</p>
          )}

          {search.data && search.data.searchFoods.length > 0 && (
            <div className="results">
              {search.data.searchFoods.map((food) => (
                <button
                  type="button"
                  key={food.fdcId}
                  aria-pressed={selected?.fdcId === food.fdcId}
                  onClick={() => setSelected(food)}
                >
                  <strong>{food.name}</strong>
                  {food.brand && <span className="muted"> · {food.brand}</span>}
                  <br />
                  <small className="muted">
                    Per 100 g: {food.per100g.calories} kcal · protein {food.per100g.protein} g · carbs{' '}
                    {food.per100g.carbs} g · fat {food.per100g.fat} g
                  </small>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {(mode === 'manual' || selected) && (
        <form onSubmit={handleAdd}>
          {mode === 'search' ? (
            <p>
              Adding: <strong>{selected.name}</strong>
            </p>
          ) : (
            <>
              <label>
                Food name
                <input value={manual.name} onChange={updateManual('name')} required maxLength={200} />
              </label>
              <p className="muted">Enter the totals for the amount you ate.</p>
              <div className="row">
                <label>
                  Calories (kcal)
                  <input type="number" min="0" step="any" value={manual.calories} onChange={updateManual('calories')} required />
                </label>
                <label>
                  Protein (g)
                  <input type="number" min="0" step="any" value={manual.protein} onChange={updateManual('protein')} />
                </label>
                <label>
                  Carbs (g)
                  <input type="number" min="0" step="any" value={manual.carbs} onChange={updateManual('carbs')} />
                </label>
                <label>
                  Fat (g)
                  <input type="number" min="0" step="any" value={manual.fat} onChange={updateManual('fat')} />
                </label>
              </div>
            </>
          )}

          <div className="row">
            <label>
              Amount (g)
              <input
                type="number"
                min="1"
                max="5000"
                step="any"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                required
              />
            </label>
            <label>
              Meal
              <select value={meal} onChange={(e) => setMeal(e.target.value)}>
                {MEALS.map((m) => (
                  <option key={m} value={m}>
                    {mealLabel(m)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {formError && <p className="error" role="alert">{formError}</p>}

          <button type="submit" disabled={addState.loading}>
            {addState.loading ? 'Adding…' : 'Add to log'}
          </button>
        </form>
      )}

      {message && <p className="success" role="status">{message}</p>}
    </section>
  );
}
