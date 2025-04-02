import { gql } from '@apollo/client';

export const START_ROUND = gql`
  mutation StartRound($course_name: String!, $players: [PlayerInput!]!) {
    start_round(course_name: $course_name, players: $players) {
      id
      course_name
      start_time
      status
      players {
        id
        player_id
        name
        handicap
        tee_id
      }
    }
  }
`;

export interface PlayerInput {
  id: string;
  name: string;
  tee_id: string;
  handicap: number;
}

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
