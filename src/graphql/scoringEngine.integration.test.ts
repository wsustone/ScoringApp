import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});

describe('ScoringEngine Integration Tests', () => {
  let roundId: string;

  test('start_round creates a new round', async () => {
    const result = await client.mutate({
      mutation: gql`
        mutation StartRound($input: StartRoundInput!) {
          start_round(input: $input) {
            id
            course_id
            status
          }
        }
      `,
      variables: {
        input: {
            id: 'round1',
            course_name: 'Test Course',
            players: [
                {
                    id: 'player1',
                    name: 'Test Player 1',
                    handicap: 10,
                    tee_id: 'tee1'
                }
            ]
        }
      }
    });

    expect(result.errors).toBeUndefined();
    expect(result.data.start_round.id).toBeDefined();
    roundId = result.data.start_round.id;
  });

  test('add_games_to_round successfully adds games', async () => {
    const result = await client.mutate({
      mutation: gql`
        mutation AddGames($input: AddGamesToRoundInput!) {
          add_games_to_round(input: $input) {
            id
            type
          }
        }
      `,
      variables: {
        input: {
          round_id: roundId,
          games: [{
            type: 'banker',
            settings: {
              banker: {
                min_dots: 1,
                max_dots: 3,
                dot_value: 1,
                double_birdie_bets: false,
                use_gross_birdies: false,
                par3_triples: false
              }
            }
          }]
        }
      }
    });

    expect(result.errors).toBeUndefined();
    expect(result.data.add_games_to_round.length).toBe(1);
  });
});
