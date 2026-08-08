import eventsJson from './data/events.json';
import gymJson from './data/gym-rematches.json';
import trainerJson from './data/trainer-rematches.json';
import mapJson from './data/map.json';
import progressionJson from './data/progression.json';
import type {
  GameEvent,
  GymLeader,
  TrainerRematch,
  MapNode,
  WalkEdge,
  CrossEdge,
  ProgressionChapter,
  ProgressionStep,
  BadgeInfo,
} from './types';

export const events = eventsJson.events as GameEvent[];
export const eventsSource = eventsJson.sourceUrl;

export const gymLeaders = gymJson.leaders as GymLeader[];
export const gymNote = gymJson.note;
export const gymSource = gymJson.sourceUrl;

// Collecting each leader's Pokégear number is a one-time daily task: it shows up
// with the daily events but, once marked done, stays done (persistent).
export const phoneEvents: GameEvent[] = gymLeaders.map((g) => ({
  id: `phone-${g.leader.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
  name: `Teléfono: ${g.leader}`,
  category: 'phone',
  days: g.phone.days,
  time: g.phone.time,
  location: g.phone.where,
  region: g.region,
  mapNode: g.phone.mapNode,
  versions: ['HG', 'SS'],
  notes: g.phone.how,
  persistent: true,
}));

// Regular events plus the persistent "get the number" tasks.
export const allEvents: GameEvent[] = [...events, ...phoneEvents];

export const trainers = trainerJson.trainers as TrainerRematch[];
export const trainerNote = trainerJson.note;
export const trainerSource = trainerJson.sourceUrl;

export const progression = progressionJson.chapters as ProgressionChapter[];
export const progressionSource = progressionJson.sourceUrl;

/** Every step, flattened in story order — handy for "next step" and counters. */
export const progressionSteps: ProgressionStep[] = progression.flatMap((c) => c.steps);

/** The 16 badges in order, each paired with the step that awards it. */
export const badges: { badge: BadgeInfo; stepId: string }[] = progressionSteps
  .filter((s) => s.badge)
  .map((s) => ({ badge: s.badge as BadgeInfo, stepId: s.id }));

export const mapNodes = mapJson.nodes as MapNode[];
export const walkEdges = mapJson.walkEdges as WalkEdge[];
export const crossEdges = mapJson.crossEdges as CrossEdge[];
