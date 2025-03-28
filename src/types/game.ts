export interface GolfHole {
  id?: string;
  number: number;
  par: number;
  strokeIndex: number;
  distance?: number;
}

export interface GolfTee {
  id: string;
  name: string;
  gender: string;
  courseRating: number;
  slopeRating: number;
  holes?: GolfHole[];
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  tees: GolfTee[];
}

export interface GameOptions {
  doubleBirdieBets: boolean;
  minDots: number;
  maxDots: number;
  dotValue: number;
}

export const defaultGameOptions: GameOptions = {
  doubleBirdieBets: false,
  minDots: 1,
  maxDots: 1,
  dotValue: 1
};

export interface HoleSetup {
  banker: string | undefined;
  dots: number;
  doubles: { [key: string]: boolean };
}

export type GameType = 'banker' | 'mrpar' | 'wolf';
