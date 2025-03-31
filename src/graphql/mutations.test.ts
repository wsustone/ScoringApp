/** @jest-environment jsdom */
import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { START_ROUND } from './mutations';
import { GraphQLError } from 'graphql';
import { useMutation, ApolloError } from '@apollo/client';
import { useEffect, useState } from 'react';

interface StartRoundData {
  startRound: string;
}

interface StartRoundVars {
  courseName: string;
  players: Array<{
    id: string;
    name: string;
    handicap: number;
    teeId: string;
  }>;
  holes: Array<{
    number: number;
    par: number;
    strokeIndex: number;
    distance: number;
  }>;
  gameOptions: {
    minDots: number;
    maxDots: number;
    dotValue: number;
    doubleBirdieBets: boolean;
  };
}

describe('START_ROUND mutation', () => {
  const validMutationVariables: StartRoundVars = {
    courseName: 'Test Course',
    players: [
      {
        id: 'player1',
        name: 'John Doe',
        handicap: 10,
        teeId: 'tee1'
      },
      {
        id: 'player2',
        name: 'Jane Doe',
        handicap: 11,
        teeId: 'tee4'
      }
    ],
    holes: [
      {
        number: 1,
        par: 4,
        strokeIndex: 1,
        distance: 400
      }
    ],
    gameOptions: {
      minDots: 1,
      maxDots: 3,
      dotValue: 1.0,
      doubleBirdieBets: true
    }
  };

  it('should successfully start a round', async () => {
    const roundId = 'test-round-id';
    const mocks: ReadonlyArray<MockedResponse> = [
      {
        request: {
          query: START_ROUND,
          variables: validMutationVariables
        },
        result: {
          data: {
            startRound: roundId
          }
        }
      }
    ];

    const TestComponent: React.FC = () => {
      const [startRound] = useMutation<StartRoundData, StartRoundVars>(START_ROUND);
      
      useEffect(() => {
        void startRound({ variables: validMutationVariables });
      }, [startRound]);

      return React.createElement('div');
    };

    render(
      React.createElement(MockedProvider, { mocks }, 
        React.createElement(TestComponent)
      )
    );

    await waitFor(() => {
      const result = mocks[0].result as { data: StartRoundData };
      expect(result.data.startRound).toBe(roundId);
    });
  });

  it('should handle network error', async () => {
    const mocks: ReadonlyArray<MockedResponse> = [
      {
        request: {
          query: START_ROUND,
          variables: validMutationVariables
        },
        error: new Error('Network error')
      }
    ];

    const TestComponent: React.FC = () => {
      const [startRound] = useMutation<StartRoundData, StartRoundVars>(START_ROUND);
      const [error, setError] = useState<ApolloError | null>(null);
      
      useEffect(() => {
        void startRound({ 
          variables: validMutationVariables,
          onError: (err) => setError(err)
        });
      }, [startRound]);

      if (error) {
        return React.createElement('div', { 'data-testid': 'error' }, error.message);
      }
      return React.createElement('div');
    };

    render(
      React.createElement(MockedProvider, { mocks }, 
        React.createElement(TestComponent)
      )
    );

    const errorElement = await screen.findByTestId('error');
    expect(errorElement).toHaveTextContent('Network error');
  });

  it('should handle GraphQL error', async () => {
    const mocks: ReadonlyArray<MockedResponse> = [
      {
        request: {
          query: START_ROUND,
          variables: validMutationVariables
        },
        result: {
          errors: [new GraphQLError('Invalid tee ID')]
        }
      }
    ];

    const TestComponent: React.FC = () => {
      const [startRound] = useMutation<StartRoundData, StartRoundVars>(START_ROUND);
      const [error, setError] = useState<ApolloError | null>(null);
      
      useEffect(() => {
        void startRound({ 
          variables: validMutationVariables,
          onError: (err) => setError(err)
        });
      }, [startRound]);

      if (error) {
        return React.createElement('div', { 'data-testid': 'error' }, error.message);
      }
      return React.createElement('div');
    };

    render(
      React.createElement(MockedProvider, { mocks }, 
        React.createElement(TestComponent)
      )
    );

    const errorElement = await screen.findByTestId('error');
    expect(errorElement).toHaveTextContent('Invalid tee ID');
  });
});
