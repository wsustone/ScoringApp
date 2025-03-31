// Mock React and useEffect hook first
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useEffect: vi.fn().mockImplementation(f => f()),
  };
});

import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BankerGame } from './BankerGame';
import { calculatePoints } from '../utils/scoring';
import '@testing-library/jest-dom';
import '@mui/material';
import { MockedProvider } from '@apollo/client/testing';
import { UPDATE_ROUND } from '../graphql/mutations';

// Mock holes for testing
const holes = [
  { id: 'hole1', number: 1, par: 4 },
  { id: 'hole2', number: 2, par: 3 },
];

// Initialize empty scores for all players
const initializeScores = (playerIds: string[]) => {
  const scores: { [key: string]: { [key: number]: number | null } } = {};
  playerIds.forEach(id => {
    scores[id] = {};
    holes.forEach(hole => {
      scores[id][hole.number] = null;
    });
  });
  return scores;
};

// Create mock for UPDATE_ROUND mutation
const updateRoundMock = {
  request: {
    query: UPDATE_ROUND,
    variables: {
      input: {
        id: "test-round-id",
        scores: [],
        bankerSetups: [
          {
            holeId: "hole1",
            bankerId: "p1",
            dots: 1
          }
        ],
        bankerDoubles: [],
        gameOptions: {
          useGrossBirdies: false,
          par3Triples: false
        }
      }
    }
  },
  result: {
    data: {
      updateRound: {
        id: "test-round-id",
        status: "IN_PROGRESS"
      }
    }
  }
};

describe('BankerGame Points Calculation', () => {
  describe('Basic Scoring Rules', () => {
    test('player wins against banker', () => {
      const points = calculatePoints(3, 4, 4, 1, false, false, false, false, false, false);
      expect(points).toBe(1);
    });

    test('player loses against banker', () => {
      const points = calculatePoints(5, 4, 4, 1, false, false, false, false, false, false);
      expect(points).toBe(-1);
    });

    test('tie results in no points', () => {
      const points = calculatePoints(4, 4, 4, 1, false, false, false, false, false, false);
      expect(points).toBe(0);
    });
  });

  describe('Double Betting Rules', () => {
    test('player double on regular hole', () => {
      const points = calculatePoints(3, 4, 4, 1, true, false, false, false, false, false);
      expect(points).toBe(2);
    });

    test('banker double on regular hole', () => {
      const points = calculatePoints(3, 4, 4, 1, false, true, false, false, false, false);
      expect(points).toBe(2);
    });

    test('both double on regular hole', () => {
      const points = calculatePoints(3, 4, 4, 1, true, true, false, false, false, false);
      expect(points).toBe(4);
    });
  });

  describe('BankerGame Component', () => {
    test('renders with initial state', () => {
      const players = [
        { id: 'p1', name: 'Player 1', handicap: 0, teeId: 'tee1' },
        { id: 'p2', name: 'Player 2', handicap: 0, teeId: 'tee1' },
      ];
      const mockScores = initializeScores(players.map(p => p.id));

      render(
        <MockedProvider mocks={[updateRoundMock]} addTypename={false}>
          <BankerGame
            holes={holes}
            players={players}
            scores={mockScores}
            currentHole={1}
            onCurrentHoleChange={() => {}}
            roundId="test-round-id"
            onScoreChange={() => {}}
          />
        </MockedProvider>
      );

      // Test for player name in the banker selector
      expect(screen.getByRole('combobox')).toHaveTextContent('Player 1');
      // Test for current hole display
      expect(screen.getByText('Hole 1', { selector: 'h6' })).toBeInTheDocument();
      // Test for navigation buttons
      expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });
  });

  describe('Multiple Players vs Banker Scoring', () => {
    test('each player is scored separately against banker', () => {
      const players = [
        { id: 'p1', name: 'Banker', handicap: 0, teeId: 'tee1' },
        { id: 'p2', name: 'Player 2', handicap: 0, teeId: 'tee1' },
        { id: 'p3', name: 'Player 3', handicap: 0, teeId: 'tee1' },
      ];
      const mockScores = initializeScores(players.map(p => p.id));

      // Set some scores for testing
      mockScores.p1[1] = 4; // Banker
      mockScores.p2[1] = 3; // Player 2
      mockScores.p3[1] = 5; // Player 3

      render(
        <MockedProvider mocks={[updateRoundMock]} addTypename={false}>
          <BankerGame
            holes={holes}
            players={players}
            scores={mockScores}
            currentHole={1}
            onCurrentHoleChange={() => {}}
            roundId="test-round-id"
            onScoreChange={() => {}}
          />
        </MockedProvider>
      );

      // Player 2 beats banker (3 vs 4)
      expect(calculatePoints(3, 4, 4, 1, false, false, false, false, false, false)).toBe(1);
      // Player 3 loses to banker (5 vs 4)
      expect(calculatePoints(5, 4, 4, 1, false, false, false, false, false, false)).toBe(-1);
    });
  });
});
