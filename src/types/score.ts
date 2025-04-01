export interface Score {
  id: string;
  roundId: string;
  playerId: string;
  holeId: string;
  grossScore: number;
  netScore: number;
  hasStroke: boolean;
  timestamp: string;
}
