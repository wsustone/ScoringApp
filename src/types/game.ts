export interface GolfHole {
  id: string;
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
  minDots: number;
  maxDots: number;
  dotValue: number;
  doubleBirdieBets: boolean;
  useGrossBirdies: boolean;
  par3Triples: boolean;
}

export const defaultGameOptions: GameOptions = {
  minDots: 1,
  maxDots: 3,
  dotValue: 0.25,
  doubleBirdieBets: false,
  useGrossBirdies: true,
  par3Triples: true
};

export interface HoleSetup {
  bankerId: string | null;
  dots: number;
  doubles: { [key: string]: boolean };
}

export type GameType = 'banker' | 'mrpar' | 'wolf';
