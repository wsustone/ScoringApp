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
});
