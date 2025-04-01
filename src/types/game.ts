export interface Hole {
  id: string;
  roundId: string;
  number: number;
  par: number;
  distance: number;
  strokeIndex: number;
}

export interface GolfHole {
  id: string;
  holeNumber: number;
  par: number;
  scoringIndex: number;
}

export interface GolfTee {
  id: string;
  name: string;
  courseRating: number;
  slopeRating: number;
  holes: GolfHole[];
}

export interface ExtendedGolfTee extends Omit<GolfTee, 'holes'> {
  holes: Hole[];
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  tees: GolfTee[];
}

export type GameType = 'banker' | 'nassau' | 'skins';

export interface HoleData {
  winner: string | null;
  points: number;
}

export interface MatchData {
  winner: string | null;
  points: number;
}

export interface BankerHoleData {
  winner: string | null;
  points: number;
  dots: number;
  holeNumber: number;
}

export interface BankerGame {
  type: 'banker';
  id: string;
  roundId: string;
  minDots: number;
  maxDots: number;
  dotValue: number;
  doubleBirdieBets: boolean;
  useGrossBirdies: boolean;
  par3Triples: boolean;
  bankerData: {
    holes: BankerHoleData[];
  };
}

export interface NassauGame {
  type: 'nassau';
  id: string;
  roundId: string;
  nassauData: {
    frontNine: MatchData;
    backNine: MatchData;
    match: MatchData;
  };
}

export interface SkinsGame {
  type: 'skins';
  id: string;
  roundId: string;
  skinsData: {
    holes: MatchData[];
  };
}

export type Game = BankerGame | NassauGame | SkinsGame;

export interface GameSettings {
  banker: {
    enabled: boolean;
    points: number;
  };
  nassau: {
    enabled: boolean;
    frontNine: number;
    backNine: number;
    match: number;
  };
  skins: {
    enabled: boolean;
    carryover: boolean;
    pointsPerSkin: number;
  };
}

export interface Round {
  id: string;
  startTime: string;
  endTime?: string;
  courseName: string;
  status: string;
  players: PlayerRound[];
  scores: Score[];
}

export interface PlayerRound {
  id: string;
  roundId: string;
  playerId: string;
  playerName: string;
  handicap: number;
  teeId: string;
}

export interface Score {
  id: string;
  roundId: string;
  holeId: string;
  playerId: string;
  score: number | null;
  timestamp: string;
}
