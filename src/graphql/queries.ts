import { gql } from '@apollo/client';
import { RoundResponse } from '../types/round';

export const GET_GOLF_COURSES = gql`
  query GetGolfCourses {
    golf_courses {
      id
      name
      location
      tee_settings {
        id
        name
        course_rating
        slope_rating
        holes {
          id
          number
          par
          stroke_index
          distance
        }
      }
    }
  }
`;

export const GET_GOLF_COURSE = gql`
  query GetGolfCourse($id: ID!) {
    golf_course(id: $id) {
      id
      name
      location
      tee_settings {
        id
        name
        course_rating
        slope_rating
        holes {
          id
          number
          par
          stroke_index
          distance
        }
      }
    }
  }
`;

export const GET_COURSE_HOLES = gql`
  query GetCourseHoles($course_id: ID!) {
    golf_course(id: $course_id) {
      id
      tee_settings {
        id
        name
        holes {
          id
          number
          par
          stroke_index
          distance
        }
      }
    }
  }
`;

export const START_ROUND = gql`
  mutation StartRound($input: StartRoundInput!) {
    start_round(input: $input) {
      id
      start_time
      end_time
      players {
        id
        name
        tee_id
      }
      games {
        id
        type
        enabled
        settings {
          banker {
            min_dots
            max_dots
            dot_value
            double_birdie_bets
            use_gross_birdies
            par3_triples
          }
          nassau {
            front_nine_bet
            back_nine_bet
            match_bet
            auto_press
            press_after
          }
          skins {
            carry_over
            bet_amount
          }
        }
      }
    }
  }
`;

export const GET_ACTIVE_ROUNDS = gql`
  query GetActiveRounds {
    get_active_rounds {
      id
      course_name
      status
      start_time
      end_time
      players {
        id
        round_id
        name
        handicap
        tee_id
      }
    }
  }
`;

export const GET_ROUND_SUMMARY = gql`
  query GetRoundSummary($id: ID!) {
    get_round(id: $id) {
      id
      course_name
      status
      start_time
      end_time
    }
  }
`;

export const GET_ROUND_PLAYERS = gql`
  query GetRoundPlayers($id: ID!) {
    get_round(id: $id) {
      players {
        id
        name
        tee_id
        holes {
          id
          number
          par
          stroke_index
          distance
        }
      }
    }
  }
`;

export const GET_ROUND_SCORES = gql`
  query GetRoundScores($id: ID!) {
    get_round(id: $id) {
      scores {
        id
        hole_id
        player_id
        gross_score
        net_score
        has_stroke
        timestamp
      }
    }
  }
`;

export const GET_ROUND = gql`
  query GetRound($id: ID!) {
    get_round(id: $id) {
      id
      course_name
      status
      start_time
      end_time
      players {
        id
        name
        tee_id
        holes {
          id
          number
          par
          stroke_index
          distance
        }
      }
      scores {
        id
        hole_id
        player_id
        gross_score
        net_score
        has_stroke
        timestamp
      }
    }
  }
`;

export const GET_ROUND_GAMES = gql`
  query GetRoundGames($id: ID!) {
    get_round(id: $id) {
      games {
        id
        type
        enabled
        settings {
          __typename
          ... on BankerSettings {
            min_dots
            max_dots
            dot_value
            double_birdie_bets
            use_gross_birdies
            par3_triples
          }
          ... on NassauSettings {
            front_nine_bet
            back_nine_bet
            match_bet
            auto_press
            press_after
          }
          ... on SkinsSettings {
            bet_amount
            carry_over
          }
        }
      }
    }
  }
`;

export const GET_SCORECARD = gql`
  query GetScorecard($round_id: ID!) {
    scorecard(round_id: $round_id) {
      id
      course_name
      players {
        id
        name
        handicap
      }
      holes {
        id
        number
        par
        stroke_index
        distance
      }
      scores {
        id
        round_id
        hole_id
        player_id
        gross_score
        net_score
        has_stroke
        timestamp
        score
      }
    }
  }
`;

export const GET_ROUND_INFO = gql`
  query GetRoundInfo($id: ID!) {
    get_round(id: $id) {
      id
      course_name
      status
      start_time
      end_time
    }
  }
`;

export const GET_ROUND_PLAYERS_INFO = gql`
  query GetRoundPlayers($id: ID!) {
    get_round(id: $id) {
      players {
        id
        round_id
        name
        handicap
        tee_id
      }
    }
  }
`;
export const GET_PLAYER_HOLES = gql`
  query GetPlayerHoles($tee_id: ID!) {
    get_player_holes(tee_id: $tee_id) {
      id
      number
      par
      stroke_index
      distance
    }
  }
`;

export const GET_ROUND_SCORES_INFO = gql`
  query GetRoundScores($id: ID!) {
    get_round(id: $id) {
      scores {
        id
        round_id
        hole_id
        player_id
        gross_score
        net_score
        has_stroke
        timestamp
      }
    }
  }
`;

export const GET_ROUND_GAMES_INFO = gql`
  query GetRoundGames($id: ID!) {
    get_round(id: $id) {
      games {
        id
        type
        enabled
        settings {
          __typename
          ... on BankerSettings {
            min_dots
            max_dots
            dot_value
            double_birdie_bets
            use_gross_birdies
            par3_triples
          }
          ... on NassauSettings {
            front_nine_bet
            back_nine_bet
            match_bet
            auto_press
            press_after
          }
          ... on SkinsSettings {
            bet_amount
            carry_over
          }
        }
      }
    }
  }
`;

export interface Score {
  id: string;
  player_id: string;
  hole_id: string;
  score: number | null;
  timestamp: string;
}

export interface GameResult {
  player_id: string;
  total_points: number;
  total_winnings: number;
}

export interface ScorecardPlayer {
  id: string;
  name: string;
  tee_id: string;
  scores: {
    hole_id: string;
    score: number | null;
  }[];
}

export interface ScorecardGame {
  id: string;
  type: string;
  enabled: boolean;
  min_dots?: number;
  max_dots?: number;
  dot_value?: number;
  double_birdie_bets?: boolean;
  use_gross_birdies?: boolean;
  par3_triples?: boolean;
  match_bet?: number;
  auto_press?: boolean;
  skin_value?: number;
  carry_over?: boolean;
  front_nine_bet?: number;
  back_nine_bet?: number;
  results: GameResult[];
}

export interface Scorecard {
  round_id: string;
  players: ScorecardPlayer[];
  games: ScorecardGame[];
}

export interface UpdateScoreResponse {
  update_score: Score;
}

export interface EndRoundResponse {
  end_round: {
    id: string;
    end_time: string;
  };
}

export interface GetScorecardResponse {
  scorecard: Scorecard;
}

export interface GetRoundResponse {
  get_round: RoundResponse;
}

export interface GetActiveRoundsResponse {
  get_active_rounds: RoundResponse[];
}
