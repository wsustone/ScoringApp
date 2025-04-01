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

export type GameType = 'banker' | 'mrpar' | 'wolf' | 'nassau' | 'skins';

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

export interface BankerHoleData {
  holeId: string;
  bankerId: string;
  dots: number;
  doubles: BankerPlayerDouble[];
}

export interface BankerPlayerDouble {
  playerId: string;
  isDoubled: boolean;
}

export interface BankerGameOptions {
  pointsPerDollar: number;
  carryOver: boolean;
  doubleBirdieBets: boolean;
  useGrossBirdies: boolean;
  par3Triples: boolean;
  holeData: BankerHoleData[];
}

export interface MrParGameOptions {
  pointsPerHole: number;
  allowTies: boolean;
}

export interface WolfGameOptions {
  pointsPerHole: number;
  allowLoneWolf: boolean;
}

export interface NassauGameOptions {
  frontNineAmount: number;
  backNineAmount: number;
  matchAmount: number;
  autoPress: boolean;
  pressEvery: number;
  carryOver: boolean;
}

export interface SkinsGameOptions {
  skinAmount: number;
  carryOver: boolean;
}

export type GameOptions = {
  banker: BankerGameOptions;
  mrpar: MrParGameOptions;
  wolf: WolfGameOptions;
  nassau: NassauGameOptions;
  skins: SkinsGameOptions;
};
