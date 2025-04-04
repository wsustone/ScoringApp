import { Hole } from './game';

export interface Player {
  id: string;
  name: string;
  handicap: number;
  tee_id: string;
  holes?: Hole[];
}

export interface PlayerRound extends Player {
  round_id: string;
  player_id: string;
}
