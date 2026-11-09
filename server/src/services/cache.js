// A small in-memory cache: remembers values for a limited time, then forgets them.
// It knows nothing about food, so it can be reused for anything.
// Note: it lives in the server's memory, so it is emptied whenever the server restarts.
export function createCache({ ttlMs, maxEntries }) {
  // key -> { value, expiresAt }. A Map remembers the order keys were added, oldest first.
  const entries = new Map();

  // Returns the remembered value, or undefined if there is none or it has expired.
  function get(key) {
    const entry = entries.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      entries.delete(key); // too old: forget it
      return undefined;
    }
    return entry.value;
  }

  // Remembers a value. If the cache is now too big, forgets the oldest entry.
  function set(key, value) {
    entries.delete(key); // so a re-saved key counts as the newest
    entries.set(key, { value, expiresAt: Date.now() + ttlMs });
    if (entries.size > maxEntries) {
      const oldestKey = entries.keys().next().value;
      entries.delete(oldestKey);
    }
  }

  return { get, set };
}