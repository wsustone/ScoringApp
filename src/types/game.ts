export type GameType = 'banker' | 'nassau' | 'skins' | 'matchplay';

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

export interface MatchPlaySettings {
  match_bet: number;
  auto_press: boolean;
  press_after: number;
}

export interface GameSettings {
  banker?: BankerSettings | null;
  nassau?: NassauSettings | null;
  skins?: SkinsSettings | null;
  matchplay?: MatchPlaySettings | null;
}

export interface Game {
  id: string;
  type: GameType;
  round_id: string;
  course_id: string;
  enabled: boolean;
  settings: GameSettings;
}

// Specialized Game interfaces for each game type
export interface BankerGame extends Omit<Game, 'settings' | 'type'> {
  type: 'banker';
  settings: BankerSettings;
}

export interface NassauGame extends Omit<Game, 'settings' | 'type'> {
  type: 'nassau';
  settings: NassauSettings;
}

export interface SkinsGame extends Omit<Game, 'settings' | 'type'> {
  type: 'skins';
  settings: SkinsSettings;
}

export interface Hole {
  id: string;
  number: number;
  par: number;
  stroke_index: number;
  distance: number;
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  tee_settings: TeeSetting[];
}

export interface TeeSetting {
  id: string;
  name: string;
  course_rating: number;
  slope_rating: number;
  holes: Hole[];
}

export interface PlayerRoundBasic {
  id: string;
  name: string;
  handicap: number;
  tee_id: string;
}

export interface HoleData {
  winner: string | null;
  points: number;
}
