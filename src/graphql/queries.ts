import { gql } from '@apollo/client';

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
      course_name
      players {
        id
        name
        tee_id
        handicap
      }
      scores {
        id
        round_id
        hole_id
        player_id
        score
        timestamp
      }
      games {
        type
        id
        course_id
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
        net_score
        gross_score
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
