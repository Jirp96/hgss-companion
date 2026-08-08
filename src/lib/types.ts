export type Version = 'HG' | 'SS';
export type Region = 'Johto' | 'Kanto' | 'Both';
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type Period = 'Morning' | 'Day' | 'Night';

export interface TimeWindow {
  start: string; // "HH:MM"
  end: string;
}

export interface GameEvent {
  id: string;
  name: string;
  category: string;
  days: 'daily' | Day[];
  time: TimeWindow | null;
  location: string;
  region: Region;
  mapNode: string | null;
  versions: Version[];
  notes: string;
  versionNotes?: Partial<Record<Version, string>>;
  // Persistent tasks (e.g. collecting a leader's phone number) stay "done"
  // forever instead of resetting each day.
  persistent?: boolean;
}

export interface TeamMember {
  name: string;
  level: number | null;
}

export interface PhoneInfo {
  where: string;
  when: string;
  how: string;
  // Structured availability + location, used to derive daily "get the number" events.
  mapNode: string;
  days: 'daily' | Day[];
  time: TimeWindow | null;
}

export interface GymLeader {
  leader: string;
  type: string;
  region: Region;
  location: string;
  awaySchedule: string;
  callWindow: { day: Day; period: Period };
  phone: PhoneInfo;
  team: TeamMember[];
}

export interface TrainerRematch {
  id: string;
  trainer: string;
  region: Region;
  location: string;
  callDays: Day[];
  period: Period | 'Any';
  hours: string;
  team: TeamMember[];
}

export interface MapNode {
  id: string;
  name: string;
  region: Region;
  flyPoint: boolean;
  x: number;
  y: number;
}

export interface WalkEdge {
  from: string;
  to: string;
  cost: number;
}

export interface CrossEdge {
  from: string;
  to: string;
  type: string;
  cost: number;
  days: Day[] | null;
}

/** Kind of progression step, used for the icon/colour in the guide. */
export type StepKind = 'story' | 'gym' | 'rocket' | 'rival' | 'league' | 'legendary' | 'unlock';

export interface BadgeInfo {
  order: number; // 1..8 within its region
  region: Region;
  es: string;
  en: string;
  leader: string;
  type: string;
}

/** External reference (Serebii page) attached to a step or chapter. */
export interface GuideLink {
  label: string;
  url: string;
}

export interface ProgressionStep {
  id: string;
  name: string;
  kind: StepKind;
  location: string;
  region: Region;
  mapNode: string | null;
  level: string;
  badge: BadgeInfo | null;
  items: string[];
  detail: string;
  /** What this step opens up (HMs, areas, mechanics). */
  unlocks: string[];
  links: GuideLink[];
  versionNotes?: Partial<Record<Version, string>>;
  /** Side content: skippable without blocking the story. */
  optional: boolean;
}

export interface ProgressionChapter {
  id: string;
  title: string;
  subtitle: string;
  region: Region;
  links: GuideLink[];
  steps: ProgressionStep[];
}

export interface Reminder {
  id: string;
  eventId: string;
  label: string;
  time: string; // "HH:MM"
  createdAt: number;
}
