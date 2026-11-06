import mongoose from 'mongoose';

// Pieces used by more than one model, written once (DRY: "Don't Repeat Yourself").

export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];

// True only for a real calendar date written as YYYY-MM-DD, e.g. "2026-11-06".
// "2026-02-30" has the right shape but is not a real date, so it is rejected.
export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Each entry belongs to one user. "ref" tells Mongoose which model the id points to.
export function userField() {
  return { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true };
}

// The calendar day an entry counts towards.
export function dateField() {
  return {
    type: String,
    required: [true, 'Date is required'],
    validate: {
      validator: isValidDateString,
      message: (props) => `"${props.value}" is not a real date in YYYY-MM-DD format`,
    },
  };
}
