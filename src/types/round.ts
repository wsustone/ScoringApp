import { Game, Score } from './game';
import { PlayerRound } from './player';

export interface Round {
  id: string;
  course_name: string;
  start_time: string;
  end_time?: string;
  status: string;
  players: PlayerRound[];
  games: Game[];
  scores: Score[];
}

export interface RoundResponse {
  id: string;
  course_name: string;
  start_time: string;
  end_time?: string;
  status: string;
  players: PlayerRound[];
  scores: Score[];
  games: Game[];
}
