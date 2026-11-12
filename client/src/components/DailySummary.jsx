import { useQuery } from '@apollo/client/react';
import { DAILY_SUMMARY_QUERY } from '../graphql/operations.js';
import { errorMessage } from '../graphql/errorMessage.js';

// The day's numbers against the calorie goal.
export function DailySummary({ date }) {
  const { data, loading, error } = useQuery(DAILY_SUMMARY_QUERY, { variables: { date } });

  if (loading && !data) return <section className="card"><p className="muted">Loading your day…</p></section>;
  if (error) return <section className="card"><p className="error" role="alert">{errorMessage(error)}</p></section>;

  const summary = data.dailySummary;
  const over = summary.remaining < 0;
  // How full the bar is: net calories as a share of the goal, kept between 0 and 100 %.
  const percent = Math.min(100, Math.max(0, Math.round((summary.net / summary.goal) * 100)));

  return (
    <section className="card">
      <h2>Summary</h2>

      <div
        className={over ? 'progress over' : 'progress'}
        role="progressbar"
        aria-label="Net calories against your goal"
        aria-valuemin={0}
        aria-valuemax={summary.goal}
        aria-valuenow={Math.max(0, summary.net)}
      >
        <div style={{ width: `${percent}%` }} />
      </div>

      <p className={over ? 'error' : ''}>
        {over
          ? `${Math.abs(summary.remaining)} kcal over your goal of ${summary.goal} kcal`
          : `${summary.remaining} kcal remaining of your ${summary.goal} kcal goal`}
      </p>

      <div className="stats">
        <Stat label="Eaten" value={summary.eaten.calories} unit="kcal" />
        <Stat label="Burned" value={summary.burned} unit="kcal" />
        <Stat label="Net" value={summary.net} unit="kcal" />
        <Stat label="Protein" value={summary.eaten.protein} unit="g" />
        <Stat label="Carbs" value={summary.eaten.carbs} unit="g" />
        <Stat label="Fat" value={summary.eaten.fat} unit="g" />
      </div>
    </section>
  );
}

// One small number tile. Only used here, so it lives in the same file.
function Stat({ label, value, unit }) {
  return (
    <div className="stat">
      <span className="muted">{label}</span>
      <strong>{value} {unit}</strong>
    </div>
  );
}
