import { useMutation, useQuery } from '@apollo/client/react';
import {
  DAILY_SUMMARY_QUERY,
  DELETE_EXERCISE_ENTRY_MUTATION,
  DELETE_FOOD_ENTRY_MUTATION,
  REFRESH_AFTER_CHANGE,
} from '../graphql/operations.js';
import { errorMessage } from '../graphql/errorMessage.js';
import { MEALS, mealLabel, round1 } from '../meals.js';

// The day's entries, grouped by meal, each with a Delete button.
// It asks for the same DailySummary query as the summary card: Apollo sends it only once
// and gives both components the same cached answer.
export function DayLog({ date }) {
  const { data } = useQuery(DAILY_SUMMARY_QUERY, { variables: { date } });
  const [deleteFood, deleteFoodState] = useMutation(DELETE_FOOD_ENTRY_MUTATION, { refetchQueries: REFRESH_AFTER_CHANGE });
  const [deleteExercise, deleteExerciseState] = useMutation(DELETE_EXERCISE_ENTRY_MUTATION, { refetchQueries: REFRESH_AFTER_CHANGE });

  if (!data) return null; // the summary card already shows "loading" or the error

  const { foodEntries, exerciseEntries } = data.dailySummary;
  const deleteError = deleteFoodState.error || deleteExerciseState.error;

  // Run a delete; if it fails, the error is shown below from the mutation's state.
  async function remove(runDelete, id) {
    try {
      await runDelete({ variables: { id } });
    } catch {
      // nothing else to do: deleteFoodState / deleteExerciseState now hold the error
    }
  }

  return (
    <section className="card">
      <h2>Food</h2>
      {foodEntries.length === 0 && <p className="muted">No food logged for this day yet.</p>}

      {MEALS.map((meal) => {
        const entries = foodEntries.filter((entry) => entry.meal === meal);
        if (entries.length === 0) return null;
        const mealCalories = round1(entries.reduce((sum, entry) => sum + entry.calories, 0));

        return (
          <div key={meal}>
            <h3>
              {mealLabel(meal)} <span className="muted">· {mealCalories} kcal</span>
            </h3>
            <ul className="list">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <span>
                    {entry.foodName}
                    <br />
                    <small className="muted">
                      {entry.grams} g · protein {entry.protein} g · carbs {entry.carbs} g · fat {entry.fat} g
                    </small>
                  </span>
                  <span className="row">
                    <strong>{entry.calories} kcal</strong>
                    <button
                      type="button"
                      className="link"
                      onClick={() => remove(deleteFood, entry.id)}
                      aria-label={`Delete ${entry.foodName}`}
                    >
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <h2 style={{ marginTop: 24 }}>Exercise</h2>
      {exerciseEntries.length === 0 && <p className="muted">No exercise logged for this day yet.</p>}
      <ul className="list">
        {exerciseEntries.map((entry) => (
          <li key={entry.id}>
            <span>
              {entry.activity}
              <br />
              <small className="muted">{entry.minutes} min</small>
            </span>
            <span className="row">
              <strong>−{entry.caloriesBurned} kcal</strong>
              <button
                type="button"
                className="link"
                onClick={() => remove(deleteExercise, entry.id)}
                aria-label={`Delete ${entry.activity}`}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>

      {deleteError && <p className="error" role="alert">{errorMessage(deleteError)}</p>}
    </section>
  );
}
