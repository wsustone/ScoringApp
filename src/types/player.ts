import { Hole } from './game';

// Basic player info without holes
export interface PlayerBasic {
  id: string;
  name: string;
  handicap: number;
  tee_id: string;
}

// Full player info with holes
export interface Player extends PlayerBasic {
  holes: Hole[];
}

// Player in a round
export interface PlayerRound extends Player {
  round_id: string;
  player_id: string;
}

// Player in active rounds list
export interface PlayerRoundBasic extends PlayerBasic {
  round_id: string;
  player_id: string;
}
