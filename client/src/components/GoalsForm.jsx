import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { REFRESH_AFTER_CHANGE, UPDATE_GOALS_MUTATION } from '../graphql/operations.js';
import { errorMessage } from '../graphql/errorMessage.js';

// Numbers become text for the input boxes; an empty macro target becomes an empty box.
function toForm(goals) {
  return {
    calories: String(goals.calories),
    protein: goals.protein == null ? '' : String(goals.protein),
    carbs: goals.carbs == null ? '' : String(goals.carbs),
    fat: goals.fat == null ? '' : String(goals.fat),
  };
}

// An empty box means "no target" (null clears it on the server); otherwise a whole number.
function toWholeNumberOrNull(text) {
  return text === '' ? null : parseInt(text, 10);
}

// Change the daily calorie goal and optional protein / carbs / fat targets.
export function GoalsForm({ user }) {
  const [form, setForm] = useState(() => toForm(user.goals));
  const [formError, setFormError] = useState(null);
  const [message, setMessage] = useState(null);

  // The mutation returns the user with their new goals. Because the user has an id, Apollo's
  // cache updates every component showing this user automatically.
  const [updateGoals, updateState] = useMutation(UPDATE_GOALS_MUTATION, { refetchQueries: REFRESH_AFTER_CHANGE });

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    setMessage(null);
    try {
      await updateGoals({
        variables: {
          input: {
            calories: parseInt(form.calories, 10),
            protein: toWholeNumberOrNull(form.protein),
            carbs: toWholeNumberOrNull(form.carbs),
            fat: toWholeNumberOrNull(form.fat),
          },
        },
      });
      setMessage('Goals saved.');
    } catch (err) {
      setFormError(errorMessage(err));
    }
  }

  return (
    <section className="card">
      <details>
        <summary>Goals: {user.goals.calories} kcal a day</summary>
        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <label>
            Daily calories (kcal)
            <input type="number" min="500" max="10000" step="1" value={form.calories} onChange={update('calories')} required />
          </label>
          <p className="muted">Optional targets in grams. Leave a box empty for no target.</p>
          <div className="row">
            <label>
              Protein (g)
              <input type="number" min="0" step="1" value={form.protein} onChange={update('protein')} />
            </label>
            <label>
              Carbs (g)
              <input type="number" min="0" step="1" value={form.carbs} onChange={update('carbs')} />
            </label>
            <label>
              Fat (g)
              <input type="number" min="0" step="1" value={form.fat} onChange={update('fat')} />
            </label>
          </div>

          {formError && <p className="error" role="alert">{formError}</p>}

          <button type="submit" disabled={updateState.loading}>
            {updateState.loading ? 'Saving…' : 'Save goals'}
          </button>
          {message && <p className="success" role="status">{message}</p>}
        </form>
      </details>
    </section>
  );
}
