export interface Score {
  id: string;
  round_id: string;
  hole_id: string;
  player_id: string;
  score: number;
  gross_score?: number;
  net_score?: number;
  strokes_received: number;
  timestamp: string;
}
