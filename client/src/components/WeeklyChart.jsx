import { useQuery } from '@apollo/client/react';
import { HISTORY_QUERY } from '../graphql/operations.js';
import { errorMessage } from '../graphql/errorMessage.js';
import { formatDate } from '../dates.js';

// Size of the drawing, in SVG units. The viewBox below makes it scale to any screen width.
const WIDTH = 700;
const HEIGHT = 240;
const TOP = 24; // room above the bars for their numbers
const BOTTOM = 28; // room below for the day names
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;

// Net calories for the 7 days ending on endDate, as bars, with the goal as a dashed line.
export function WeeklyChart({ endDate }) {
  const { data, loading, error } = useQuery(HISTORY_QUERY, { variables: { endDate, days: 7 } });

  if (loading && !data) return <section className="card"><p className="muted">Loading your week…</p></section>;
  if (error) return <section className="card"><p className="error" role="alert">{errorMessage(error)}</p></section>;

  const days = data.history;
  const goal = days[0]?.goal ?? 0;
  // The tallest thing we need to fit: the biggest day, or the goal line.
  const maxValue = Math.max(goal, ...days.map((day) => day.net), 1);
  const slotWidth = WIDTH / days.length;
  const barWidth = slotWidth * 0.6;

  // Turns calories into a height on the drawing. SVG's y grows downwards, so bigger values
  // get a smaller y (higher up). Negative days (burned more than eaten) are drawn as 0.
  const y = (value) => TOP + PLOT_HEIGHT - (Math.max(0, value) / maxValue) * PLOT_HEIGHT;

  return (
    <section className="card">
      <h2>Last 7 days</h2>
      <svg
        className="chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Net calories for the last 7 days against a goal of ${goal} kcal`}
      >
        {days.map((day, i) => {
          const x = i * slotWidth + (slotWidth - barWidth) / 2;
          const top = y(day.net);
          return (
            <g key={day.date}>
              <title>{`${formatDate(day.date)}: ${day.net} kcal net (eaten ${day.eaten}, burned ${day.burned})`}</title>
              <rect
                className={day.net > goal ? 'bar over' : 'bar'}
                x={x}
                y={top}
                width={barWidth}
                height={TOP + PLOT_HEIGHT - top}
                rx={4}
              />
              <text x={x + barWidth / 2} y={top - 6}>{Math.round(day.net)}</text>
              <text x={x + barWidth / 2} y={HEIGHT - 8}>{formatDate(day.date, { weekday: 'short' })}</text>
            </g>
          );
        })}
        <line className="goal-line" x1={0} x2={WIDTH} y1={y(goal)} y2={y(goal)} />
      </svg>
      <p className="muted">Bars: net calories each day. Dashed line: your goal ({goal} kcal). Red bars are over the goal.</p>
    </section>
  );
}
