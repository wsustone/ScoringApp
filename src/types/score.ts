export interface Score {
  id: string;
  round_id: string;
  player_id: string;
  hole_id: string;
  score: number | null;
  timestamp: string;
  net_score?: number | null;
  has_stroke?: boolean;
}
