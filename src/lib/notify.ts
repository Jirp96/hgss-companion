import { writable, get } from 'svelte/store';
import { reminders, now } from './stores';
import { dateKey } from './dateUtils';

const supported = typeof window !== 'undefined' && 'Notification' in window;

export const notificationsEnabled = writable<boolean>(
  supported && Notification.permission === 'granted'
);

export async function requestNotifications(): Promise<void> {
  if (!supported) return;
  const perm = await Notification.requestPermission();
  notificationsEnabled.set(perm === 'granted');
}

// Track which reminders already fired, keyed by `${date}:${reminderId}` so each
// fires at most once per local day.
const fired = new Set<string>();

function check(current: Date) {
  if (!supported || Notification.permission !== 'granted') return;
  const hhmm = `${String(current.getHours()).padStart(2, '0')}:${String(
    current.getMinutes()
  ).padStart(2, '0')}`;
  const day = dateKey(current);
  for (const r of get(reminders)) {
    if (r.time !== hhmm) continue;
    const key = `${day}:${r.id}`;
    if (fired.has(key)) continue;
    fired.add(key);
    try {
      new Notification('HGSS Companion', { body: `${r.time} — ${r.label}` });
    } catch {
      /* ignore */
    }
  }
}

/** Start watching the clock to fire due reminders. Call once at app start. */
export function startReminderWatcher(): () => void {
  if (!supported) return () => {};
  return now.subscribe((d) => check(d));
}
