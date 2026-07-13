import { writable, type Writable } from 'svelte/store';
import type { Reminder, Version } from './types';
import { dateKey } from './dateUtils';

const PREFIX = 'hgss:';

function persisted<T>(key: string, initial: T): Writable<T> {
  const full = PREFIX + key;
  let start = initial;
  try {
    const raw = localStorage.getItem(full);
    if (raw !== null) start = JSON.parse(raw) as T;
  } catch {
    /* ignore malformed/blocked storage */
  }
  const store = writable<T>(start);
  store.subscribe((value) => {
    try {
      localStorage.setItem(full, JSON.stringify(value));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  });
  return store;
}

// Selected game version.
export const version = persisted<Version>('version', 'HG');

// Reminders created by the user.
export const reminders = persisted<Reminder[]>('reminders', []);

/**
 * "Done" event ids, scoped to the current local date. Daily events reset each
 * day: we store { date, ids } and clear ids when the date rolls over.
 */
interface DoneState {
  date: string;
  ids: string[];
}

function createDoneStore() {
  const store = persisted<DoneState>('done', { date: dateKey(), ids: [] });

  // Reset if the stored date is stale (new day).
  store.update((s) => (s.date === dateKey() ? s : { date: dateKey(), ids: [] }));

  function toggle(id: string) {
    store.update((s) => {
      const date = dateKey();
      const ids = s.date === date ? s.ids : [];
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      return { date, ids: next };
    });
  }

  return { subscribe: store.subscribe, toggle };
}

export const done = createDoneStore();

/**
 * Permanent "done" ids for one-time tasks (e.g. collecting a leader's phone
 * number). Unlike `done`, these never reset when the day rolls over.
 */
function createPermanentDone() {
  const store = persisted<string[]>('permanentDone', []);
  function toggle(id: string) {
    store.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }
  return { subscribe: store.subscribe, toggle };
}

export const permanentDone = createPermanentDone();

// A ticking clock (updates every 30s) so time-window UI stays fresh.
function createNow() {
  const store = writable<Date>(new Date());
  if (typeof window !== 'undefined') {
    setInterval(() => store.set(new Date()), 30_000);
  }
  return { subscribe: store.subscribe };
}

export const now = createNow();
