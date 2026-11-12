import { formatDate, shiftDate, todayString } from '../dates.js';

// Choose which day to look at: previous / next buttons, a date box, and a jump back to today.
export function DayPicker({ date, onChange }) {
  const today = todayString();

  return (
    <section className="card">
      <h2>{date === today ? 'Today' : formatDate(date)}</h2>
      <div className="row day-picker">
        <button type="button" className="secondary" onClick={() => onChange(shiftDate(date, -1))} aria-label="Previous day">
          ‹
        </button>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          aria-label="Day to show"
        />
        <button
          type="button"
          className="secondary"
          onClick={() => onChange(shiftDate(date, 1))}
          disabled={date >= today}
          aria-label="Next day"
        >
          ›
        </button>
        {date !== today && (
          <button type="button" className="secondary" onClick={() => onChange(today)}>
            Today
          </button>
        )}
      </div>
    </section>
  );
}
