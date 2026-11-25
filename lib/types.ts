export type ActionId = 'develop' | 'freelance' | 'marketing' | 'study' | 'rest' | 'job';
export type Slot = 'day' | 'night';
export type Role = 'programmer' | 'artist' | 'planner';
export type EventId = 'teamConcern' | 'illness' | 'leaving' | 'kindness' | 'poseidon' | 'shipwreck' | 'calypso' | 'calypsoThreat';
export type CardId = 'poseidon' | 'helios' | 'circe' | 'shipwreck' | 'calypso';
export type Tab = 'diary' | 'planner' | 'status';
export interface WeekSchedule { day: ActionId; night: ActionId }
export interface Crew { id: string; name: string; role: string; morale: number; active: boolean }
export interface DiaryEntry {
  id: number;
  when: string;
  kind: 'chapter' | 'dialogue' | 'note' | 'event';
  title?: string;
  speaker?: string;
  body: string[];
  delta?: string;
  myth?: boolean;
}
export interface StoryEvent {
  title: string;
  kind: 'myth' | 'normal';
  image?: CardId;
  body: string;
  choices: {id: string; text: string}[];
}
export interface GameState {
  version: 3;
  company: string;
  game: string;
  role: Role;
  year: number;
  month: number;
  week: number;
  phase: 'voyage' | 'calypso';
  schedule: WeekSchedule[];
  player: {health: number; stress: number; skill: number; art: number; business: number; savings: number; bonds: number};
  companyState: {cash: number; reputation: number; trust: number; team: Crew[]; releasedGames: number};
  project: {progress: number; quality: number; buzz: number; bugs: number; released: boolean; weeklySales: number; totalSales: number; monthsSinceRelease: number};
  flags: {
    teamConcern?: boolean; illnessRecent?: number; leaving?: boolean; kindness?: boolean;
    poseidonRecent?: number; letter?: boolean; monthSettled?: boolean;
    promiseMonth?: number; promiseEcho?: boolean;
  };
  log: DiaryEntry[];
  pending: EventId | null;
  myth: EventId | null;
  storyIndex: number;
  ending: 'drowned' | null;
  history: {projects: {title: string; released: boolean}[]; turns: number; rollCount: number};
  catalogue: {title: string; quality: number; buzz: number; age: number}[];
}
export interface ActionResult {success: boolean; die: number; total: number; delta: string}
