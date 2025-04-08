/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BankerGame } from './BankerGame';
import { UPDATE_SCORE } from '../graphql/mutations';
import '@testing-library/jest-dom';
import { PlayerRound } from '../types/player';
import { Hole } from '../types/game';
import { vi } from 'vitest';

const mockHoles: Hole[] = [
  { id: 'hole1', number: 1, par: 4, stroke_index: 1, distance: 400 },
  { id: 'hole2', number: 2, par: 4, stroke_index: 2, distance: 180 }, // Changed par to 4 for eagle test
  { id: 'hole3', number: 3, par: 5, stroke_index: 3, distance: 520 }
];

const mockPlayers: PlayerRound[] = [
  { 
    id: 'player1', 
    round_id: 'round1', 
    player_id: 'p1', 
    name: 'Player 1', 
    handicap: 10, 
    tee_id: 'tee1',
    holes: mockHoles 
  },
  { 
    id: 'player2', 
    round_id: 'round1', 
    player_id: 'p2', 
    name: 'Player 2', 
    handicap: 15, 
    tee_id: 'tee1',
    holes: mockHoles
  }
];

const mockScores = {
  player1: {
    1: 3, // Birdie on par 4 (2 points)
    2: 2, // Eagle on par 4 (4 points)
    3: 5  // Par on par 5 (1 point)
  },
  player2: {
    1: 4, // Par on par 4 (1 point)
    2: 3, // Birdie on par 4 (2 points)
    3: 6  // Bogey on par 5 (0 points)
  }
};

describe('BankerGame', () => {
  const defaultProps = {
    players: mockPlayers,
    holes: mockHoles,
    scores: mockScores,
    currentHole: 1,
    roundId: 'round1',
    onScoreChange: vi.fn(),
    gameSettings: {
      banker: {
        min_dots: 1,
        max_dots: 4,
        dot_value: 1,
        double_birdie_bets: true,
        use_gross_birdies: false,
        par3_triples: false
      }
    }
  };

  const mocks = [
    {
      request: {
        query: UPDATE_SCORE,
        variables: {
          roundId: 'round1',
          holeNumber: 1,
          playerId: 'player1',
          score: 4
        }
      },
      result: {
        data: {
          updateScore: true
        }
      }
    }
  ];

  it('renders player names and scores', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BankerGame {...defaultProps} />
      </MockedProvider>
    );

    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
  });

  it('calculates points correctly', () => {
    // Test hole 1 first
    const { unmount } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BankerGame {...defaultProps} />
      </MockedProvider>
    );

    // Player 1 has a birdie (2 points)
    expect(screen.getByText('2')).toBeInTheDocument();

    // Clean up before rendering again
    unmount();
    
    // Test hole 2
    const props = { ...defaultProps, currentHole: 2 };
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BankerGame {...props} />
      </MockedProvider>
    );
    
    // Player 1 has an eagle (4 points)
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('handles score updates', async () => {
    const onScoreChange = vi.fn();
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BankerGame {...defaultProps} onScoreChange={onScoreChange} />
      </MockedProvider>
    );

    // Find the score input for Player 1
    const scoreInput = screen.getAllByRole('spinbutton')[0];
    
    // Change the score
    fireEvent.change(scoreInput, { target: { value: '4' } });

    // Wait for the mutation to complete
    await waitFor(() => {
      expect(onScoreChange).toHaveBeenCalledWith('player1', 1, 4);
    });
  });
});
