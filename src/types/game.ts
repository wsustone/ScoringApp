export interface HoleSetup {
  banker: string | null;
  dots: number;
  doubles: { [playerId: string]: boolean };
  pin: string | null;
  teeBox: string | null;
}

export interface Hole {
  number: number;
  par: number;
  strokeIndex: number;
}

export interface Player {
  id: string;
  name: string;
  handicap: number;
  teeId: string;
}

export type GameType = 'banker' | 'mrpar' | 'wolf';
