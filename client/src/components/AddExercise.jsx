import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { ADD_EXERCISE_ENTRY_MUTATION, REFRESH_AFTER_CHANGE } from '../graphql/operations.js';
import { errorMessage } from '../graphql/errorMessage.js';

// Log a workout. Calories burned are subtracted from calories eaten.
export function AddExercise({ date }) {
  const [activity, setActivity] = useState('');
  const [minutes, setMinutes] = useState('30');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [formError, setFormError] = useState(null);
  const [message, setMessage] = useState(null);

  const [addExerciseEntry, addState] = useMutation(ADD_EXERCISE_ENTRY_MUTATION, { refetchQueries: REFRESH_AFTER_CHANGE });

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    setMessage(null);
    try {
      await addExerciseEntry({
        variables: {
          input: {
            date,
            activity: activity.trim(),
            minutes: parseInt(minutes, 10), // the schema says Int: a whole number
            caloriesBurned: Number(caloriesBurned),
          },
        },
      });
      setMessage(`Added ${activity.trim()}.`);
      setActivity('');
      setCaloriesBurned('');
    } catch (err) {
      setFormError(errorMessage(err));
    }
  }

  return (
    <section className="card">
      <h2>Add exercise</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Activity
          <input
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="e.g. Running"
            required
            maxLength={100}
          />
        </label>
        <div className="row">
          <label>
            Minutes
            <input type="number" min="1" max="1440" step="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} required />
          </label>
          <label>
            Calories burned (kcal)
            <input
              type="number"
              min="0"
              max="5000"
              step="any"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value)}
              required
            />
          </label>
        </div>

        {formError && <p className="error" role="alert">{formError}</p>}

        <button type="submit" disabled={addState.loading}>
          {addState.loading ? 'Adding…' : 'Add exercise'}
        </button>
      </form>
      {message && <p className="success" role="status">{message}</p>}
    </section>
  );
}
