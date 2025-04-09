import { Game, PlayerRound } from './game';
import { Score as ApiScore } from '@scoringengine/api-types';

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
}

interface Score {
    hole_id: string;
    player_id: string;
    gross_score: number;
    net_score: number;
    strokes_received: number;
}
