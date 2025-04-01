export interface Hole {
  id: string;
  roundId: string;
  holeNumber: number;
  par: number;
}

export interface GolfTee {
  id: string;
  name: string;
  gender: string;
  courseRating: number;
  slopeRating: number;
  holes?: Hole[];
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  tees: GolfTee[];
}

export type GameType = 'banker' | 'mrpar' | 'wolf';

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
