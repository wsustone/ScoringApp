export type GameType = 'banker' | 'nassau' | 'skins';

export interface BaseGame {
  id: string;
  type: GameType;
  roundId: string;
  enabled: boolean;
}

export interface BankerGame extends BaseGame {
  type: 'banker';
  minDots: number;
  maxDots: number;
  dotValue: number;
  doubleBirdieBets: boolean;
  useGrossBirdies: boolean;
  par3Triples: boolean;
  bankerData: {
    holes: {
      winner: string | null;
      points: number;
      dots: number;
      holeNumber: number;
      doubles: string[];
    }[];
  };
}

export interface NassauGame extends BaseGame {
  type: 'nassau';
  frontNinePoints: number;
  backNinePoints: number;
  matchPoints: number;
  nassauData: {
    frontNine: {
      winner: string | null;
      points: number;
    };
    backNine: {
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
  pointsPerSkin: number;
  skinsData: {
    holes: {
      winner: string | null;
      points: number;
    }[];
  };
}

export type Game = BankerGame | NassauGame | SkinsGame;

export interface GolfHole {
  id: string;
  holeNumber: number;
  par: number;
  scoringIndex: number;
}

export interface Hole {
  id: string;
  roundId: string;
  number: number;
  par: number;
  distance: number;
  strokeIndex: number;
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

export interface HoleData {
  winner: string | null;
  points: number;
}

export interface BankerHoleData extends HoleData {
  dots: number;
  holeNumber: number;
  doubles: string[];
}

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
  start_time: string;
  end_time?: string;
  course_name: string;
  status: string;
  players: {
    id: string;
    round_id: string;
    player_id: string;
    player_name: string;
    handicap: number;
    tee_id: string;
  }[];
  scores: {
    id: string;
    round_id: string;
    hole_id: string;
    player_id: string;
    score: number | null;
    timestamp: string;
  }[];
}

export const createGame = (type: GameType, roundId: string): Game => {
  const baseGame = {
    id: `${type}-${roundId}`,
    type,
    roundId,
    enabled: true,
  };

  switch (type) {
    case 'banker':
      return {
        ...baseGame,
        minDots: 1,
        maxDots: 4,
        dotValue: 1,
        doubleBirdieBets: true,
        useGrossBirdies: false,
        par3Triples: false,
        bankerData: {
          holes: [],
        },
      } as BankerGame;
    case 'nassau':
      return {
        ...baseGame,
        frontNinePoints: 0,
        backNinePoints: 0,
        matchPoints: 0,
        nassauData: {
          frontNine: {
            winner: null,
            points: 0,
          },
          backNine: {
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
        pointsPerSkin: 1,
        skinsData: {
          holes: [],
        },
      } as SkinsGame;
  }
};
