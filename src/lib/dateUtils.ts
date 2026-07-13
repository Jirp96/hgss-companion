import type { Day, GameEvent, Period, TimeWindow, Version } from './types';

export const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_LABELS: Record<Day, string> = {
  Mon: 'Lunes',
  Tue: 'Martes',
  Wed: 'Miércoles',
  Thu: 'Jueves',
  Fri: 'Viernes',
  Sat: 'Sábado',
  Sun: 'Domingo',
};

export const PERIOD_LABELS: Record<Period | 'Any', string> = {
  Morning: 'Mañana',
  Day: 'Día',
  Night: 'Noche',
  Any: 'Cualquiera',
};

// HGSS in-game time periods.
export const PERIOD_WINDOWS: Record<Period, TimeWindow> = {
  Morning: { start: '04:00', end: '09:59' },
  Day: { start: '10:00', end: '19:59' },
  Night: { start: '20:00', end: '03:59' },
};

/** JS getDay() -> our Day code (JS: 0=Sun). */
export function jsDayToDay(jsDay: number): Day {
  return DAYS[(jsDay + 6) % 7];
}

export function todayDay(now: Date = new Date()): Day {
  return jsDayToDay(now.getDay());
}

export function occursOnDay(event: GameEvent, day: Day): boolean {
  return event.days === 'daily' || event.days.includes(day);
}

export function availableInVersion(event: GameEvent, version: Version): boolean {
  return event.versions.includes(version);
}

/** "HH:MM" -> minutes since midnight. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Whether `now` falls within a window, handling wrap-around past midnight. */
export function withinWindow(win: TimeWindow, now: Date = new Date()): boolean {
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(win.start);
  const end = toMinutes(win.end);
  if (start <= end) return cur >= start && cur <= end;
  return cur >= start || cur <= end; // wraps midnight (e.g. Night 20:00-03:59)
}

/** YYYY-MM-DD key for local date (used for daily-reset of "done"). */
export function dateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
