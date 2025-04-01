/** @jest-environment jsdom */
import { MockedProvider } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { START_ROUND } from './mutations';
import { GraphQLError } from 'graphql';
import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';

interface Score {
  id: string;
  playerId: string;
  holeId: string;
  grossScore: number;
  netScore: number;
  hasStroke: boolean;
  timestamp: string;
}

interface Player {
  id: string;
  name: string;
  handicap: number;
  teeID: string;
}

interface CreateRoundData {
  createRound: {
    id: string;
    courseId: string;
    courseName: string;
    status: string;
    startTime: string;
    players: Player[];
    scores: Score[];
  };
}

interface CreateRoundVars {
  input: {
    courseId: string;
    players: Array<{
      id: string;
      name: string;
      handicap: number;
      teeID: string;
    }>;
  };
}

describe('START_ROUND mutation', () => {
  const validMutationVariables: CreateRoundVars = {
    input: {
      courseId: 'course1',
      players: [
        {
          id: 'player1',
          name: 'John Doe',
          handicap: 10,
          teeID: 'tee1'
        },
        {
          id: 'player2',
          name: 'Jane Doe',
          handicap: 11,
          teeID: 'tee4'
        }
      ]
    }
  };

  const mockData: CreateRoundData = {
    createRound: {
      id: 'round1',
      courseId: 'course1',
      courseName: 'Test Course',
      status: 'active',
      startTime: new Date().toISOString(),
      players: validMutationVariables.input.players,
      scores: [] // Initially empty scores array
    }
  };

  it('executes successfully', async () => {
    const mocks = [
      {
        request: {
          query: START_ROUND,
          variables: validMutationVariables
        },
        result: {
          data: mockData
        }
      }
    ];

    function TestComponent() {
      const [startRound, { data, error }] = useMutation<CreateRoundData, CreateRoundVars>(START_ROUND);
      const [mutationCalled, setMutationCalled] = useState(false);

      useEffect(() => {
        if (!mutationCalled) {
          startRound({ variables: validMutationVariables })
            .catch(() => {}); // Prevent unhandled rejection
          setMutationCalled(true);
        }
      }, [mutationCalled, startRound]);

      if (error) return <div>Error</div>;
      if (data) return <div>Success</div>;
      return null;
    }

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestComponent />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles network error', async () => {
    const mocks = [
      {
        request: {
          query: START_ROUND,
          variables: validMutationVariables
        },
        error: new Error('Network error')
      }
    ];

    function TestComponent() {
      const [startRound, { error }] = useMutation<CreateRoundData, CreateRoundVars>(START_ROUND);
      const [mutationCalled, setMutationCalled] = useState(false);

      useEffect(() => {
        if (!mutationCalled) {
          startRound({ variables: validMutationVariables })
            .catch(() => {}); // Prevent unhandled rejection
          setMutationCalled(true);
        }
      }, [mutationCalled, startRound]);

      if (error) return <div>Error</div>;
      return null;
    }

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestComponent />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles GraphQL error', async () => {
    const mocks = [
      {
        request: {
          query: START_ROUND,
          variables: validMutationVariables
        },
        result: {
          data: null,
          errors: [new GraphQLError('GraphQL error')]
        }
      }
    ];

    function TestComponent() {
      const [startRound, { error }] = useMutation<CreateRoundData, CreateRoundVars>(START_ROUND);
      const [mutationCalled, setMutationCalled] = useState(false);

      useEffect(() => {
        if (!mutationCalled) {
          startRound({ variables: validMutationVariables })
            .catch(() => {}); // Prevent unhandled rejection
          setMutationCalled(true);
        }
      }, [mutationCalled, startRound]);

      if (error) return <div>Error</div>;
      return null;
    }

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestComponent />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
