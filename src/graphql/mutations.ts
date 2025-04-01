import { gql } from '@apollo/client';

export const START_ROUND = gql`
  mutation StartRound($input: StartRoundInput!) {
    startRound(input: $input) {
      id
      courseId
      date
      players {
        id
        name
        teeId
      }
      games {
        id
        type
        enabled
        dotValue
        maxDots
        bankerData {
          holes {
            holeNumber
            winner
            points
            dots
            doubles
          }
        }
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
