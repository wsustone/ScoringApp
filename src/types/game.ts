export type GameType = 'banker' | 'nassau' | 'skins';

export interface BaseGame {
  id: string;
  type: GameType;
  enabled: boolean;
  round_id: string;
  course_id: string;
}

export interface BankerSettings {
  min_dots: number;
  max_dots: number;
  dot_value: number;
  double_birdie_bets: boolean;
  use_gross_birdies: boolean;
  par3_triples: boolean;
}

export interface NassauSettings {
  front_nine_bet: number;
  back_nine_bet: number;
  match_bet: number;
  auto_press: boolean;
  press_after: number;
}

export interface SkinsSettings {
  bet_amount: number;
  carry_over: boolean;
}

export type GameSettings = BankerSettings | NassauSettings | SkinsSettings;

export interface BankerGame extends BaseGame {
  type: 'banker';
  settings: BankerSettings;
}

export interface NassauGame extends BaseGame {
  type: 'nassau';
  settings: NassauSettings;
}

export interface SkinsGame extends BaseGame {
  type: 'skins';
  settings: SkinsSettings;
}

export type Game = BankerGame | NassauGame | SkinsGame;

export interface Hole {
  id: string;
  number: number;
  par: number;
  stroke_index: number;
  distance: number;
}

export interface TeeSetting {
  id: string;
  name: string;
  course_rating: number;
  slope_rating: number;
  holes: Hole[];
}

export interface GolfCourse {
  id: string;
  name: string;
  location?: string;
  tee_settings: TeeSetting[];
}

export interface Player {
  id: string;
  round_id: string;
  player_id: string;
  name: string;
  handicap: number;
  tee_id: string;
  holes?: Hole[];
}

export interface Score {
  id: string;
  round_id: string;
  hole_id: string;
  player_id: string;
  score: number | undefined;
  gross_score: number | undefined;
  net_score: number | undefined;
  has_stroke: boolean;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface Round {
  id: string;
  start_time: string;
  end_time?: string;
  course_name: string;
  status: string;
  players: Player[];
  scores: Score[];
}

export interface PlayerInput {
  id: string;
  name: string;
  tee_id: string;
  handicap: number;
}

export interface GameInput {
  type: 'banker' | 'nassau' | 'skins';
  enabled: boolean;
  course_id: string;
  settings: GameSettings;
}

export interface StartRoundInput {
  course_name: string;
  players: PlayerInput[];
  games: GameInput[];
}

export interface HoleData {
  winner: string | null;
  points: number;
}

export const createGame = (type: GameType, roundId: string, courseId: string): Game => {
  const baseGame = {
    id: Math.random().toString(36).substring(7),
    round_id: roundId,
    course_id: courseId,
    enabled: true,
  };

  switch (type) {
    case 'banker':
      return {
        ...baseGame,
        type: 'banker',
        settings: {
          min_dots: 1,
          max_dots: 3,
          dot_value: 1,
          double_birdie_bets: true,
          use_gross_birdies: false,
          par3_triples: true,
        },
      } as BankerGame;
    case 'nassau':
      return {
        ...baseGame,
        type: 'nassau',
        settings: {
          front_nine_bet: 5,
          back_nine_bet: 5,
          match_bet: 5,
          auto_press: false,
          press_after: 2,
        },
      } as NassauGame;
    case 'skins':
      return {
        ...baseGame,
        type: 'skins',
        settings: {
          bet_amount: 1,
          carry_over: true,
        },
      } as SkinsGame;
  }
};
