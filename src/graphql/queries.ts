import { gql } from '@apollo/client';

export const GET_GOLF_COURSES = gql`
  query GetGolfCourses {
    golf_courses {
      id
      name
      tees {
        id
        name
        gender
        course_rating
        slope_rating
        holes {
          id
          hole_number
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
      tees {
        id
        name
        gender
        course_rating
        slope_rating
        holes {
          id
          hole_number
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
      tees {
        id
        name
        holes {
          id
          hole_number
          par
          stroke_index
          distance
        }
      }
    }
  }
`;

export const GET_ROUND = gql`
  query GetRound($id: ID!) {
    get_round(id: $id) {
      id
      start_time
      end_time
      course_name
      status
      players {
        id
        round_id
        player_id
        name
        handicap
        tee_id
      }
      scores {
        id
        round_id
        hole_id
        player_id
        score
        timestamp
      }
    }
  }
`;

export const GET_ACTIVE_ROUNDS = gql`
  query GetActiveRounds {
    get_active_rounds {
      id
      start_time
      end_time
      course_name
      status
      players {
        id
        round_id
        player_id
        name
        handicap
        tee_id
      }
      scores {
        id
        round_id
        hole_id
        player_id
        score
        timestamp
      }
    }
  }
`;

export const START_ROUND = gql`
  mutation StartRound($input: StartRoundInput!) {
    start_round(input: $input) {
      course_id
      players {
        id
        name
        handicap
        tee_id
      }
    }
  }
`;

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
    }
  }
`;

export const UPDATE_SCORE = gql`
  mutation UpdateScore(
    $round_id: ID!
    $hole_number: Int!
    $player_id: String!
    $score: Int
  ) {
    update_score(
      round_id: $round_id
      hole_number: $hole_number
      player_id: $player_id
      score: $score
    )
  }
`;

export const END_ROUND = gql`
  mutation EndRound($id: ID!) {
    end_round(id: $id)
  }
`;
