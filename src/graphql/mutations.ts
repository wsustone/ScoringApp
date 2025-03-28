import { gql } from '@apollo/client';

export const START_ROUND = gql`
  mutation StartRound(
    $courseName: String!,
    $players: [PlayerInput!]!,
    $holes: [HoleInput!]!,
    $gameOptions: GameOptionsInput!
  ) {
    startRound(
      courseName: $courseName,
      players: $players,
      holes: $holes,
      gameOptions: $gameOptions
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
      bankerSetups {
        id
        holeId
        bankerId
        dots
      }
      bankerDoubles {
        id
        holeId
        playerId
        isDoubled
      }
      gameOptions {
        minDots
        maxDots
        dotValue
        doubleBirdieBets
      }
    }
  }
`;
