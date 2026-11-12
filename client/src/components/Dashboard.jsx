import { useState } from 'react';
import { todayString } from '../dates.js';
import { DayPicker } from './DayPicker.jsx';
import { DailySummary } from './DailySummary.jsx';
import { AddFood } from './AddFood.jsx';
import { AddExercise } from './AddExercise.jsx';
import { DayLog } from './DayLog.jsx';
import { WeeklyChart } from './WeeklyChart.jsx';
import { GoalsForm } from './GoalsForm.jsx';

// The main screen for a logged-in user. It owns one piece of state, the chosen day,
// and passes it down to every part that needs it.
export function Dashboard({ user }) {
  const [date, setDate] = useState(todayString);

  return (
    <>
      <DayPicker date={date} onChange={setDate} />
      <DailySummary date={date} />
      <AddFood date={date} />
      <AddExercise date={date} />
      <DayLog date={date} />
      <WeeklyChart endDate={date} />
      <GoalsForm user={user} />
    </>
  );
}
