import { gql } from '@apollo/client';

export const START_ROUND = gql`
  mutation StartRound($input: StartRoundInput!) {
    start_round(input: $input) {
      id
      course_name
      status
      start_time
    }
  }
`;

export const ADD_GAMES_TO_ROUND = gql`
  mutation AddGamesToRound($input: AddGamesToRoundInput!) {
    add_games_to_round(input: $input) {
      id
      round_id
      course_id
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
          bet_amount
          carry_over
        }
      }
    }
  }
`;

export interface PlayerInput {
  name: string;
  tee_id: string;
  handicap: number;
}

export interface GameSettings {
  banker?: {
    min_dots: number;
    max_dots: number;
    dot_value: number;
    double_birdie_bets: boolean;
    use_gross_birdies: boolean;
    par3_triples: boolean;
  };
  nassau?: {
    front_nine_bet: number;
    back_nine_bet: number;
    match_bet: number;
    auto_press: boolean;
    press_after: number;
  };
  skins?: {
    bet_amount: number;
    carry_over: boolean;
  };
}

export interface GameInput {
  type: 'banker' | 'nassau' | 'skins';
  enabled: boolean;
  settings: GameSettings;
}

export const UPDATE_SCORE = gql`
  mutation UpdateScore($input: UpdateScoreInput!) {
    update_score(input: $input) {
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
`;

export const UPDATE_PLAYER = gql`
  mutation UpdatePlayer($input: UpdatePlayerInput!) {
    update_player(input: $input) {
      id
      round_id
      player_id
      name
      handicap
      tee_id
    }
  }
`;

export const UPDATE_GAME_SETTINGS = gql`
  mutation UpdateGameSettings($input: UpdateGameSettingsInput!) {
    update_game_settings(input: $input) {
      id
      round_id
      course_id
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
          bet_amount
          carry_over
        }
      }
    }
  }
`;

export const END_ROUND = gql`
  mutation EndRound($id: ID!) {
    end_round(id: $id) {
      id
      status
    }
  }
`;

export const DISCARD_ROUND = gql`
  mutation DiscardRound($id: ID!) {
    discard_round(id: $id)
  }
`;
