import eventsJson from './data/events.json';
import gymJson from './data/gym-rematches.json';
import trainerJson from './data/trainer-rematches.json';
import mapJson from './data/map.json';
import type { GameEvent, GymLeader, TrainerRematch, MapNode, WalkEdge, CrossEdge } from './types';

export const events = eventsJson.events as GameEvent[];
export const eventsSource = eventsJson.sourceUrl;

export const gymLeaders = gymJson.leaders as GymLeader[];
export const gymNote = gymJson.note;
export const gymSource = gymJson.sourceUrl;

export const trainers = trainerJson.trainers as TrainerRematch[];
export const trainerNote = trainerJson.note;
export const trainerSource = trainerJson.sourceUrl;

export const mapNodes = mapJson.nodes as MapNode[];
export const walkEdges = mapJson.walkEdges as WalkEdge[];
export const crossEdges = mapJson.crossEdges as CrossEdge[];
