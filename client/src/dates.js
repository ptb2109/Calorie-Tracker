// Dates are kept as "YYYY-MM-DD" text, the same format the server uses.

// Today's date on THIS device (the user's own time zone), e.g. "2026-11-13".
export function todayString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

// A date moved by some days, e.g. shiftDate("2026-11-01", -1) -> "2026-10-31".
// Calculated in UTC so no time zone can shift it.
export function shiftDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// A readable label such as "Fri, 13 Nov", in the browser's language.
export function formatDate(dateString, options = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString(undefined, { ...options, timeZone: 'UTC' });
}
