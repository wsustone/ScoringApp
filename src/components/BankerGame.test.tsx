import { describe, expect, vi } from 'vitest';
import { render, screen, within } from '../test/utils';
import { BankerGame, calculatePoints } from './BankerGame';
import { Player } from './PlayerForm';
import { HoleSetup } from '../types/game';
import '@testing-library/jest-dom';

// Test data setup
const players: Player[] = [
  { id: 'p1', name: 'Player 1', handicap: 0, teeId: 't1' },
  { id: 'p2', name: 'Player 2', handicap: 0, teeId: 't1' },
  { id: 'p3', name: 'Player 3', handicap: 0, teeId: 't1' },
  { id: 'p4', name: 'Player 4', handicap: 0, teeId: 't1' },
];

const holes = [
  { number: 1, par: 4 },
  { number: 2, par: 3 },
  { number: 3, par: 5 },
];

const emptyHoleSetup: HoleSetup = {
  banker: undefined,
  dots: 0,
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

describe('BankerGame Points Calculation', () => {
  describe('Basic Scoring Rules', () => {
    test('calculates points for player win', () => {
      const result = calculatePoints(3, 4, 4, 1, false, false, false, false);
      expect(result.points).toBe(1);
      expect(result.isPositive).toBe(true);
    });

    test('calculates points for player loss', () => {
      const result = calculatePoints(5, 4, 4, 1, false, false, false, false);
      expect(result.points).toBe(1);
      expect(result.isPositive).toBe(false);
    });

    test('handles tie with no points', () => {
      const result = calculatePoints(4, 4, 4, 1, false, false, false, false);
      expect(result.points).toBe(0);
      expect(result.isPositive).toBe(true);
    });
  });

  
  describe('Double Betting Rules', () => {
    test('applies double and win with par', () => {
      const result = calculatePoints(3, 4, 3, 1, true, false, false, false);
      expect(result.points).toBe(2);
      expect(result.isPositive).toBe(true);
    });

    test('applies both doubles with win', () => {
      const result = calculatePoints(3, 4, 3, 1, true, true, false, false);
      expect(result.points).toBe(4);
      expect(result.isPositive).toBe(true);
    });
 
  });

  describe('Birdie and Eagle Rules', () => {
    test('doubles points for birdie no doubles', () => {
      const result = calculatePoints(3, 4, 4, 1, false, false, true, false);
      expect(result.points).toBe(2);
      expect(result.isPositive).toBe(true);
    });

    test('quadruples points for eagle no doubles', () => {
      const result = calculatePoints(2, 4, 4, 1, false, false, true, false);
      expect(result.points).toBe(4);
      expect(result.isPositive).toBe(true);
    });

    test('applies birdie multiplier with one double', () => {
      const result = calculatePoints(3, 4, 4, 1, true, false, true, false);
      expect(result.points).toBe(4);
      expect(result.isPositive).toBe(true);
    });

    test('applies birdie multiplier with both double', () => {
      const result = calculatePoints(3, 4, 4, 1, true, true, true, false);
      expect(result.points).toBe(8);
      expect(result.isPositive).toBe(true);
    });
  });

  describe('Banker Perspective', () => {
    test('calculates points for banker win', () => {
      const result = calculatePoints(4, 3, 3, 1, false, false, false, true);
      expect(result.points).toBe(1);
      expect(result.isPositive).toBe(true);
    });

    test('calculates points for banker loss', () => {
      const result = calculatePoints(3, 4, 3, 1, false, false, false, true);
      expect(result.points).toBe(1);
      expect(result.isPositive).toBe(false);
    });

    test('handles banker birdie with doubles', () => {
      const result = calculatePoints(4, 3, 4, 1, false, true, true, true);
      expect(result.points).toBe(4);
      expect(result.isPositive).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    test('banker doubles, player doubles, player gets birdie', () => {
      const result = calculatePoints(3, 4, 4, 1, true, true, true, false);
      expect(result.points).toBe(8);
      expect(result.isPositive).toBe(true);
    });

    test('banker perspective with all multipliers', () => {
      const result = calculatePoints(5, 3, 4, 1, true, true, true, true);
      expect(result.points).toBe(8);
      expect(result.isPositive).toBe(true);
    });

  });

  describe('Multiple Players vs Banker Scoring', () => {
    const setup = {
      banker: 'p1' as string,
      dots: 1,
      doubles: {} as { [key: string]: boolean }
    };

    test('each player is scored separately against banker', () => {
      const scores: { [key: string]: { [key: number]: number } } = {
        p1: { 1: 4 }, // Banker
        p2: { 1: 3 }, // Wins
        p3: { 1: 5 }, // Loses
        p4: { 1: 4 }  // Ties
      };

      const result = players.reduce((acc, player) => {
        if (player.id === setup.banker) return acc;

        const playerScore = scores[player.id][1];
        const bankerScore = scores[setup.banker][1];
        
        const playerResult = calculatePoints(
          playerScore,
          bankerScore,
          4,
          setup.dots,
          false,
          false,
          false,
          false
        );

        acc.playerPoints[player.id] = playerResult.isPositive ? playerResult.points : -playerResult.points;
        acc.bankerPoints[player.id] = acc.playerPoints[player.id] ? -acc.playerPoints[player.id] : 0;
        
        return acc;
      }, {
        bankerPoints: {} as { [key: string]: number },
        playerPoints: {} as { [key: string]: number }
      });

      // Player 2 wins (1 dot)
      expect(result.playerPoints['p2']).toBe(1);
      expect(result.bankerPoints['p2']).toBe(-1);

      // Player 3 loses (1 dot)
      expect(result.playerPoints['p3']).toBe(-1);
      expect(result.bankerPoints['p3']).toBe(1);

      // Player 4 ties (0 dots)
      expect(result.playerPoints['p4']).toBe(0);
      expect(result.bankerPoints['p4']).toBe(0);
    });

    test('doubles are applied individually', () => {
      const scoresWithDoubles: { [key: string]: { [key: number]: number } } = {
        p1: { 1: 4 }, // Banker (doubled)
        p2: { 1: 3 }, // Wins (doubled)
        p3: { 1: 5 }, // Loses (not doubled)
        p4: { 1: 3 }  // Wins (not doubled)
      };

      const setupWithDoubles = {
        ...setup,
        doubles: {
          p1: true,
          p2: true
        } as { [key: string]: boolean }
      };

      const result = players.reduce((acc, player) => {
        if (player.id === setupWithDoubles.banker) return acc;

        const playerScore = scoresWithDoubles[player.id][1];
        const bankerScore = scoresWithDoubles[setupWithDoubles.banker][1];
        
        const playerResult = calculatePoints(
          playerScore,
          bankerScore,
          4,
          setupWithDoubles.dots,
          Boolean(setupWithDoubles.doubles[player.id]),
          Boolean(setupWithDoubles.doubles[setupWithDoubles.banker]),
          false,
          false
        );

        acc.playerPoints[player.id] = playerResult.isPositive ? playerResult.points : -playerResult.points;
        acc.bankerPoints[player.id] = -acc.playerPoints[player.id];
        
        return acc;
      }, {
        bankerPoints: {} as { [key: string]: number },
        playerPoints: {} as { [key: string]: number }
      });

      // Player 2 (doubled) vs Banker (doubled) = 4x
      expect(result.playerPoints['p2']).toBe(4);
      expect(result.bankerPoints['p2']).toBe(-4);

      // Player 3 (not doubled) vs Banker (doubled) = 2x
      expect(result.playerPoints['p3']).toBe(-2);
      expect(result.bankerPoints['p3']).toBe(2);

      // Player 4 (not doubled) vs Banker (doubled) = 2x
      expect(result.playerPoints['p4']).toBe(2);
      expect(result.bankerPoints['p4']).toBe(-2);
    });

    test('birdie multipliers are applied to each matchup', () => {
      const scoresWithBirdies: { [key: string]: { [key: number]: number } } = {
        p1: { 1: 3 }, // Banker makes birdie
        p2: { 1: 3 }, // Ties with birdie
        p3: { 1: 2 }, // Wins with eagle
        p4: { 1: 4 }  // Loses with par
      };

      const setupWithDoubles = {
        ...setup,
        doubles: {
          p1: true,
          p3: true
        } as { [key: string]: boolean }
      };

      const result = players.reduce((acc, player) => {
        if (player.id === setupWithDoubles.banker) return acc;

        const playerScore = scoresWithBirdies[player.id][1];
        const bankerScore = scoresWithBirdies[setupWithDoubles.banker][1];
        
        const playerResult = calculatePoints(
          playerScore,
          bankerScore,
          4,
          setupWithDoubles.dots,
          Boolean(setupWithDoubles.doubles[player.id]),
          Boolean(setupWithDoubles.doubles[setupWithDoubles.banker]),
          true,
          false
        );

        acc.playerPoints[player.id] = playerResult.isPositive ? playerResult.points : -playerResult.points;
        acc.bankerPoints[player.id] = acc.playerPoints[player.id] ? -acc.playerPoints[player.id] : 0;
        
        return acc;
      }, {
        bankerPoints: {} as { [key: string]: number },
        playerPoints: {} as { [key: string]: number }
      });

      // Player 2 (tie) = 0 points despite birdies
      expect(result.playerPoints['p2']).toBe(0);
      expect(result.bankerPoints['p2']).toBe(0);

      // Player 3 (doubled eagle vs doubled birdie) = 16x
      expect(result.playerPoints['p3']).toBe(16);
      expect(result.bankerPoints['p3']).toBe(-16);

      // Player 4 (par vs birdie) = 2x from banker double, 2x from birdie = 4x
      expect(result.playerPoints['p4']).toBe(-4);
      expect(result.bankerPoints['p4']).toBe(4);
    });
  });

  describe('Component Integration', () => {
    const defaultProps = {
      players,
      scores: {},
      holes,
      currentHole: 1,
      onCurrentHoleChange: vi.fn(),
      onScoreChange: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
    });

    test('renders banker selection', () => {
      render(<BankerGame {...defaultProps} />);
      expect(screen.getByRole('combobox', { name: /select banker/i })).toBeInTheDocument();
    });

    test('renders dots selection', () => {
      render(<BankerGame {...defaultProps} />);
      expect(screen.getByRole('spinbutton', { name: /dots/i })).toBeInTheDocument();
    });

    test('renders doubles section', () => {
      render(<BankerGame {...defaultProps} />);
      expect(screen.getByText(/doubles/i)).toBeInTheDocument();
    });

    test('renders birdie bet option', () => {
      render(<BankerGame {...defaultProps} />);
      expect(screen.getByText(/double birdie/i)).toBeInTheDocument();
    });

    test('renders player scores', () => {
      const scores = {
        p1: { 1: 4 },
        p2: { 1: 3 },
      };
      render(<BankerGame {...defaultProps} scores={scores} />);
      
      const scoreTable = screen.getByRole('table', { name: /player scores/i });
      expect(scoreTable).toBeInTheDocument();
      
      const player1Name = within(scoreTable).getByText('Player 1');
      const player2Name = within(scoreTable).getByText('Player 2');
      
      expect(player1Name).toBeInTheDocument();
      expect(player2Name).toBeInTheDocument();
      
      const inputs = within(scoreTable).getAllByLabelText(/score for player/i);
      expect(inputs).toHaveLength(4); // All players should have score inputs
      
      expect(inputs[0]).toHaveValue(4);
      expect(inputs[1]).toHaveValue(3);
    });
  });
});
