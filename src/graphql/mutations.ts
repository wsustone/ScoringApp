import { gql } from '@apollo/client';

export const START_ROUND = gql`
  mutation StartRound($courseName: String!, $players: [PlayerInput!]!) {
    startRound(courseName: $courseName, players: $players) {
      id
      startTime
      courseName
      status
      players {
        id
        roundId
        playerId
        playerName
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

export const END_ROUND = gql`
  mutation EndRound($id: ID!) {
    endRound(id: $id)
  }
`;
