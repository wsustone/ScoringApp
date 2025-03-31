import { gql } from '@apollo/client';

export const START_ROUND = gql`
  mutation StartRound(
    $courseName: String!,
    $players: [PlayerInput!]!,
    $holes: [HoleInput!]!
  ) {
    startRound(
      courseName: $courseName,
      players: $players,
      holes: $holes
    )
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
