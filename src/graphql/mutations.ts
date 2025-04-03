import { gql } from '@apollo/client';

export const START_ROUND = gql`
  mutation StartRound($input: StartRoundInput!) {
    start_round(input: $input) {
      id
      course_name
      players {
        id
        name
        tee_id
        handicap
      }
      games {
        id
        type
        course_id
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

export interface StartRoundInput {
  course_name: string;
  players: {
    id: string;
    name: string;
    tee_id: string;
    handicap: number;
  }[];
}

export const UPDATE_ROUND = gql`
  mutation UpdateRound($input: UpdateRoundInput!) {
    update_round(input: $input) {
      id
      course_id
      course_name
      status
      players {
        id
        name
        handicap
        tee_id
      }
      scores {
        id
        player_id
        hole_id
        score
        timestamp
      }
      games {
        id
        type
        course_id
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
  
export const UPDATE_SCORE = gql`
  mutation UpdateScore($round_id: ID!, $hole_id: ID!, $player_id: String!, $score: Int!) {
    update_score(round_id: $round_id, hole_id: $hole_id, player_id: $player_id, score: $score) {
      id
      round_id
      hole_id
      player_id
      score
      timestamp
    }
  }
`;

export const END_ROUND = gql`
  mutation EndRound($round_id: ID!) {
    end_round(round_id: $round_id) {
      id
      course_name
      start_time
      end_time
      status
    }
  }
`;
