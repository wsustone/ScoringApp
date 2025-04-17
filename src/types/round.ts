import { Game, Hole } from './game';
import { PlayerRound } from './player';
import { Score } from './score';

export interface Round {
  id: string;
  course_id: string;
  start_time: string;
  end_time?: string;
  status: string;
  players: PlayerRound[];
  games: Game[];
  scores: Score[];
}

export interface RoundResponse {
  id: string;
  course_id: string;
  start_time: string;
  end_time?: string;
  status: string;
  players: PlayerRound[];
  scores: Score[];
  games: Game[];
  holes: Hole[]; // <-- Add holes property for use in Scorecard
}
