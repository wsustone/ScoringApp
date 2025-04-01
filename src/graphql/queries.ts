import { gql } from '@apollo/client';

export const GET_GOLF_COURSES = gql`
  query GetGolfCourses {
    golfCourses {
      id
      name
      tees {
        id
        name
        gender
        courseRating
        slopeRating
        holes {
          id
          holeNumber
          par
          scoringIndex
        }
      }
    }
  }
`;

export const GET_GOLF_COURSE = gql`
  query GetGolfCourse($id: ID!) {
    golfCourse(id: $id) {
      id
      name
      tees {
        id
        name
        gender
        courseRating
        slopeRating
        holes {
          id
          holeNumber
          par
          scoringIndex
        }
      }
    }
  }
`;

export const GET_COURSE_HOLES = gql`
  query GetCourseHoles($courseId: ID!) {
    golfCourse(id: $courseId) {
      id
      tees {
        id
        name
        holes {
          id
          holeNumber
          par
          scoringIndex
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
        roundId
        playerId
        name
        handicap
        teeID
      }
      scores {
        id
        roundId
        holeId
        playerId
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
      startTime
      endTime
      courseName
      status
      players {
        id
        roundId
        playerId
        name
        handicap
        teeId
      }
      scores {
        id
        roundId
        holeId
        playerId
        score
        timestamp
      }
    }
  }
`;

export const START_ROUND = gql`
  mutation StartRound($input: StartRoundInput!) {
    startRound(input: $input) {
      courseId
      players {
        id
        name
        handicap
        teeID
      }
    }
  }
`;

export const UPDATE_ROUND = gql`
  mutation UpdateRound($input: UpdateRoundInput!) {
    updateRound(input: $input) {
      id
      courseId
      courseName
      status
      players {
        id
        name
        handicap
        teeID
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

export const END_ROUND = gql`
  mutation EndRound($id: ID!) {
    endRound(id: $id)
  }
`;
