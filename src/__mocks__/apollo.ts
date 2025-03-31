import { UPDATE_ROUND } from '../graphql/mutations';

export const mocks = [
  {
    request: {
      query: UPDATE_ROUND,
      variables: {
        roundId: 'test-round-id',
        scores: [
          {
            playerId: 'p1',
            score: 4,
            hole: 1,
            dots: 1,
            isDouble: false,
          },
        ],
      },
    },
    result: {
      data: {
        updateRound: 'test-round-id',
      },
    },
  },
];
