import { describe, expect, test, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BankerGame } from './BankerGame';
import { calculatePoints } from '../utils/scoring';
import { HoleSetup } from '../types/game';
import '@testing-library/jest-dom';
import '@mui/material';
import { MockedProvider } from '@apollo/client/testing';
import { UPDATE_ROUND } from '../graphql/mutations';

// Mock holes for testing
const holes = [
  { id: 'hole1', number: 1, par: 4 },
  { id: 'hole2', number: 2, par: 3 },
];

const emptyHoleSetup: HoleSetup = {
  bankerId: undefined,
  dots: 1,
  doubles: {}
};

// Mock game options
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: vi.fn().mockImplementation((init) => [init, vi.fn()]),
  };
});

// Mock mutation for testing
const mocks = [
  {
    request: {
      query: UPDATE_ROUND,
      variables: {
        input: {
          id: 'test-round',
          scores: [],
          bankerSetups: [],
          bankerDoubles: [],
          gameOptions: {
            minDots: 1,
            maxDots: 3,
            dotValue: 0.25,
            doubleBirdieBets: false,
            useGrossBirdies: true,
            par3Triples: true
          }
        }
      }
    },
    result: {
      data: {
        updateRound: {
          id: 'test-round'
        }
      }
    }
  }
];

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

  describe('Triple Par 3 Rules', () => {
    test('player triple on par 3', () => {
      const points = calculatePoints(2, 3, 3, 1, true, false, false, true, true, false);
      expect(points).toBe(3);
    });

    test('banker triple on par 3', () => {
      const points = calculatePoints(2, 3, 3, 1, false, true, false, true, true, false);
      expect(points).toBe(3);
    });

    test('both triple on par 3', () => {
      const points = calculatePoints(2, 3, 3, 1, true, true, false, true, true, false);
      expect(points).toBe(9);
    });

    test('triple with birdie', () => {
      const points = calculatePoints(2, 3, 3, 1, true, false, true, true, true, false);
      expect(points).toBe(6); // 1 * 3 (triple) * 2 (birdie)
    });
  });

  describe('Birdie and Eagle Rules', () => {
    test('player birdie doubles points', () => {
      const points = calculatePoints(3, 4, 4, 1, false, false, true, false, false, false);
      expect(points).toBe(2);
    });

    test('banker birdie doubles points', () => {
      const points = calculatePoints(5, 3, 4, 1, false, false, true, false, false, false);
      expect(points).toBe(-2);
    });

    test('player eagle quadruples points', () => {
      const points = calculatePoints(2, 4, 4, 1, false, false, true, false, false, false);
      expect(points).toBe(4);
    });

    test('banker eagle quadruples points', () => {
      const points = calculatePoints(5, 2, 4, 1, false, false, true, false, false, false);
      expect(points).toBe(-4);
    });

    test('birdie vs birdie', () => {
      const points = calculatePoints(3, 3, 4, 1, false, false, true, false, false, false);
      expect(points).toBe(0); // Tie, no points
    });

    test('birdie vs eagle', () => {
      const points = calculatePoints(3, 2, 4, 1, false, false, true, false, false, false);
      expect(points).toBe(-4); // Eagle (4x) beats birdie (2x)
    });

    test('triple and birdie on par 3', () => {
      const points = calculatePoints(2, 3, 3, 1, true, true, true, true, true, false);
      expect(points).toBe(18); // 1 * 3 (player) * 3 (banker) * 2 (birdie)
    });

    test('double and eagle on regular hole', () => {
      const points = calculatePoints(2, 4, 4, 1, true, true, true, false, false, false);
      expect(points).toBe(16); // 1 * 2 (player) * 2 (banker) * 4 (eagle)
    });
  });

  describe('Banker Perspective', () => {
    test('calculates points for banker win', () => {
      // When banker scores 3 and player scores 4, player loses
      const points = calculatePoints(4, 3, 3, 1, false, false, false, false, false, false);
      expect(points).toBe(-1); // Player loses 1 point
    });

    test('calculates points for banker loss', () => {
      // When banker scores 4 and player scores 3, player wins
      const points = calculatePoints(3, 4, 3, 1, false, false, false, false, false, false);
      expect(points).toBe(1); // Player wins 1 point
    });

    test('calculates complex scoring scenario', () => {
      // Banker scores birdie (2 on par 3) with double, player scores 4
      const points = calculatePoints(4, 2, 3, 1, false, true, true, true, true, false);
      expect(points).toBe(-6); // Player loses 6 points (1 * 3 (triple) * 2 (birdie))
    });
  });

  describe('Multiple Players vs Banker Scoring', () => {
    test('each player is scored separately against banker', () => {
      const setup = {
        bankerId: 'p1',
        dots: 1,
        doubles: {}
      };

      const scores: Record<string, { [key: number]: number }> = {
        p1: { 1: 4 },  // Banker
        p2: { 1: 4 },  // Tie
        p3: { 1: 5 }   // Loss
      };

      // Calculate points for each non-banker player
      const results = Object.entries(scores)
        .filter(([id]) => id !== setup.bankerId)
        .reduce((acc, [playerId, playerScores]) => {
          const points = calculatePoints(
            playerScores[1],
            scores[setup.bankerId][1],
            holes[0].par,
            setup.dots,
            false,
            false,
            false,
            false,
            false,
            false
          );

          acc.playerPoints[playerId] = points;
          return acc;
        }, {
          playerPoints: {} as Record<string, number>
        });

      // Check results
      expect(results.playerPoints['p2']).toBe(0);  // Tie = 0
      expect(results.playerPoints['p3']).toBe(-1); // Loss = -1
    });
  });

  describe('Component Integration', () => {
    const mockHoles = [
      { id: 'hole1', number: 1, par: 4 },
      { id: 'hole2', number: 2, par: 3 }
    ];

    const mockPlayers = [
      { id: 'p1', name: 'Player 1', handicap: 0, teeId: 't1' },
      { id: 'p2', name: 'Player 2', handicap: 0, teeId: 't1' },
      { id: 'p3', name: 'Player 3', handicap: 0, teeId: 't1' }
    ];

    const mockScores: Record<string, { [key: number]: number }> = {
      p1: { 1: 4 },
      p2: { 1: 5 },
      p3: { 1: 4 }
    };

    const defaultProps = {
      holes: mockHoles,
      players: mockPlayers,
      scores: mockScores,
      currentHole: 1,
      onCurrentHoleChange: vi.fn(),
      onScoreChange: vi.fn(),
      courseName: 'Test Course',
      roundId: 'test-round'
    };

    const renderWithApollo = (ui: React.ReactNode) => {
      return render(
        <MockedProvider mocks={mocks} addTypename={false}>
          {ui}
        </MockedProvider>
      );
    };

    // Test that the banker selection is rendered when there are enough players
    test('renders banker selection when enough players', () => {
      renderWithApollo(<BankerGame {...defaultProps} />);
      // Find the banker setup section
      const bankerSetupHeading = screen.getByText('Banker Setup');
      expect(bankerSetupHeading).toBeInTheDocument();
      // Find the select element within the banker setup section
      const bankerSetupSection = screen.getByRole('region', { name: /banker setup/i });
      // Material-UI Select renders as a button with aria-haspopup="listbox"
      const bankerSelect = within(bankerSetupSection).getByRole('button', {
        name: /banker/i,
        expanded: false
      });
      expect(bankerSelect).toBeInTheDocument();
      expect(bankerSelect).toHaveAttribute('aria-haspopup', 'listbox');
    });

    // Test that the dots selection is rendered when enough players
    test('renders dots selection when enough players', () => {
      renderWithApollo(<BankerGame {...defaultProps} />);
      // Find the banker setup section
      const bankerSetupHeading = screen.getByText('Banker Setup');
      expect(bankerSetupHeading).toBeInTheDocument();
      // Find the dots input within the banker setup section
      const bankerSetupSection = screen.getByRole('region', { name: /banker setup/i });
      const dotsInput = within(bankerSetupSection).getByRole('spinbutton');
      expect(dotsInput).toBeInTheDocument();
    });

    // Test that the doubles section is rendered when there are enough players
    test('renders doubles section when enough players', () => {
      renderWithApollo(<BankerGame {...defaultProps} />);
      // Find the score table
      const scoreTable = screen.getByRole('table');
      expect(scoreTable).toBeInTheDocument();
      // Check for Double column header
      const doubleHeader = screen.getByText('Double');
      expect(doubleHeader).toBeInTheDocument();
    });

    // Test that the player scores are rendered when enough players
    test('renders player scores when enough players', () => {
      renderWithApollo(<BankerGame {...defaultProps} />);
      // Find the score table
      const scoreTable = screen.getByRole('table');
      expect(scoreTable).toBeInTheDocument();
      // Each player should have a score cell
      const playerNames = defaultProps.players.map(p => p.name);
      playerNames.forEach(name => {
        const playerCell = screen.getByText(name);
        expect(playerCell).toBeInTheDocument();
      });
    });

    test('calculates correct points for multiple players', () => {
      const setup = {
        bankerId: 'p1',
        dots: 1,
        doubles: {}
      };

      const points = calculatePoints(
        mockScores.p2[1],
        mockScores.p1[1],
        mockHoles[0].par,
        setup.dots,
        false,
        false,
        false,
        false,
        false,
        false
      );

      expect(points).toBe(-1); // Player 2 loses to banker
    });

    test('handles doubles correctly', () => {
      const setup = {
        bankerId: 'p1',
        dots: 1,
        doubles: { p1: true, p2: true }
      };

      const points = calculatePoints(
        mockScores.p2[1],
        mockScores.p1[1],
        mockHoles[0].par,
        setup.dots,
        true,
        true,
        false,
        false,
        false,
        false
      );

      expect(points).toBe(-4); // Player 2 loses with both doubled (4x)
    });

    test('handles par 3 triples correctly', () => {
      const setup = {
        bankerId: 'p1',
        dots: 1,
        doubles: { p1: true, p2: true }
      };

      const points = calculatePoints(
        3, // Player score
        2, // Banker score (birdie)
        3, // Par 3
        setup.dots,
        true,
        true,
        true,
        true,
        true,
        false
      );

      expect(points).toBe(-18); // Player loses with both tripled (9x) and birdie (2x)
    });
  });
});
