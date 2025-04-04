export type GameType = 'banker' | 'nassau' | 'skins';

export interface BaseGame {
  id: string;
  type: GameType;
  round_id: string;
  course_id: string;
  enabled: boolean;
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

export interface GameSettings {
  banker?: BankerSettings;
  nassau?: NassauSettings;
  skins?: SkinsSettings;
}

export interface BankerGame extends BaseGame {
  type: 'banker';
  settings: {
    banker: BankerSettings;
  };
  banker_data: {
    holes: {
      winner: string | null;
      points: number;
      dots: number;
      hole_number: number;
      doubles: string[];
    }[];
  };
}

export interface NassauGame extends BaseGame {
  type: 'nassau';
  settings: {
    nassau: NassauSettings;
  };
  nassau_data: {
    front_nine: {
      winner: string | null;
      points: number;
    };
    back_nine: {
      winner: string | null;
      points: number;
    };
    match: {
      winner: string | null;
      points: number;
    };
  };
}

export interface SkinsGame extends BaseGame {
  type: 'skins';
  settings: {
    skins: SkinsSettings;
  };
  skins_data: {
    holes: {
      winner: string | null;
      points: number;
    }[];
  };
}

export type Game = BankerGame | NassauGame | SkinsGame;

export interface Hole {
  id: string;
  number: number;
  par: number;
  stroke_index: number;
  distance: number;
}

export interface GolfTee {
  id: string;
  name: string;
  course_rating: number;
  slope_rating: number;
  holes: Hole[];
}

export interface ExtendedGolfTee extends Omit<GolfTee, 'holes'> {
  holes: Hole[];
}

export interface GolfCourse {
  id: string;
  name: string;
  location?: string;
  tee_settings: GolfTee[];
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

export interface HoleData {
  winner: string | null;
  points: number;
}

export interface BankerHoleData extends HoleData {
  dots: number;
  hole_number: number;
  doubles: string[];
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
          banker: {
            min_dots: 1,
            max_dots: 3,
            dot_value: 1,
            double_birdie_bets: true,
            use_gross_birdies: false,
            par3_triples: true,
          },
        },
        banker_data: {
          holes: [],
        },
      } as BankerGame;
    case 'nassau':
      return {
        ...baseGame,
        type: 'nassau',
        settings: {
          nassau: {
            front_nine_bet: 5,
            back_nine_bet: 5,
            match_bet: 5,
            auto_press: false,
            press_after: 2,
          },
        },
        nassau_data: {
          front_nine: {
            winner: null,
            points: 0,
          },
          back_nine: {
            winner: null,
            points: 0,
          },
          match: {
            winner: null,
            points: 0,
          },
        },
      } as NassauGame;
    case 'skins':
      return {
        ...baseGame,
        type: 'skins',
        settings: {
          skins: {
            bet_amount: 1,
            carry_over: true,
          },
        },
        skins_data: {
          holes: [],
        },
      } as SkinsGame;
  }
};

export interface Round {
  id: string;
  start_time: string;
  end_time?: string;
  course_name: string;
  status: string;
  players: Player[];
  scores: {
    id: string;
    round_id: string;
    hole_id: string;
    player_id: string;
    score: number | null;
    timestamp: string;
  }[];
}
