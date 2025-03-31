import { gql } from '@apollo/client';

export const GET_GOLF_COURSES = gql`
  query GetGolfCourses {
    golfCourses {
      id
      name
      location
      teeSettings {
        id
        name
        courseRating
        slopeRating
      }
    }
  }
`;

export const GET_GOLF_COURSE = gql`
  query GetGolfCourse($id: ID!) {
    golfCourse(id: $id) {
      id
      name
      location
      teeSettings {
        id
        name
        courseRating
        slopeRating
        holes {
          id
          number
          par
          strokeIndex
          distance
        }
      }
    }
  }
`;

export const GET_COURSE_HOLES = gql`
  query GetCourseHoles($courseId: ID!) {
    golfCourse(id: $courseId) {
      id
      teeSettings {
        holes {
          number
          par
          strokeIndex
        }
      }
    }
  }
`;

export const GET_ROUND = gql`
  query GetRound($id: ID!) {
    getRound(id: $id) {
      id
      startTime
      endTime
      courseName
      status
      players {
        id
        playerId
        name
        handicap
        teeId
      }
      holes {
        id
        number
        par
      }
      scores {
        id
        playerId
        holeId
        score
        timestamp
      }
    }
  }
`;

export const GET_ACTIVE_ROUNDS = gql`
  query GetActiveRounds {
    getActiveRounds {
      id
      courseName
      startTime
      players {
        name
        handicap
      }
    }
  }
`;

export const START_ROUND = gql`
  mutation StartRound($input: StartRoundInput!) {
    startRound(input: $input) {
      id
      startTime
      courseName
      status
      players {
        id
        playerId
        name
        handicap
        teeId
      }
    }
  }
`;

export const UPDATE_ROUND = gql`
  mutation UpdateRound($input: UpdateRoundInput!) {
    updateRound(input: $input) {
      id
      scores {
        id
        playerId
        holeId
        score
        timestamp
      }
    }
  }
`;

export const UPDATE_SCORE = gql`
  mutation UpdateScore(
    $roundId: ID!
    $holeNumber: Int!
    $playerId: String!
    $score: Int
  ) {
    updateScore(
      roundId: $roundId
      holeNumber: $holeNumber
      playerId: $playerId
      score: $score
    )
  }
`;

export const UPDATE_BANKER_SETUP = gql`
  mutation UpdateBankerSetup(
    $roundId: ID!
    $holeNumber: Int!
    $bankerId: String
    $dots: Int!
    $doubles: [BankerDoubleInput!]!
  ) {
    updateBankerSetup(
      roundId: $roundId
      holeNumber: $holeNumber
      bankerId: $bankerId
      dots: $dots
      doubles: $doubles
    )
  }
`;

export const END_ROUND = gql`
  mutation EndRound($id: ID!) {
    endRound(id: $id)
  }
`;
