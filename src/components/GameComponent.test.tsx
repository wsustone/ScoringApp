/** @jsxImportSource @emotion/react */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameComponent } from './GameComponent';
import { Game } from '../types/game';
import { vi } from 'vitest';

const mockGames: Game[] = [
  {
    id: 'game1',
    type: 'banker',
    round_id: 'round1',
    course_id: 'course1',
    enabled: true,
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
  },
  {
    id: 'game2',
    type: 'nassau',
    round_id: 'round1',
    course_id: 'course1',
    enabled: true,
    settings: {} // No settings
  }
];

const mockOnGameChange = vi.fn();

describe('GameComponent', () => {
  test('renders banker settings when present', () => {
    render(
      <GameComponent 
        onGameChange={mockOnGameChange} 
        selectedGames={[mockGames[0]]} 
        courseId="course1" 
      />
    );
    
    expect(screen.getByLabelText('Min Dots')).toBeInTheDocument();
    expect(screen.getByLabelText('Max Dots')).toBeInTheDocument();
    expect(screen.getByLabelText('Dot Value')).toBeInTheDocument();
  });

  test('does not render banker settings when missing', () => {
    const gameWithoutSettings: Game = {
      ...mockGames[0],
      settings: {} // No banker settings
    };

    render(
      <GameComponent 
        onGameChange={mockOnGameChange} 
        selectedGames={[gameWithoutSettings]} 
        courseId="course1" 
      />
    );

    expect(screen.queryByLabelText('Min Dots')).not.toBeInTheDocument();
  });

  test('does not render nassau settings when missing', () => {
    render(
      <GameComponent 
        onGameChange={mockOnGameChange} 
        selectedGames={[mockGames[1]]} 
        courseId="course1" 
      />
    );
    
    expect(screen.queryByLabelText('Front Bet')).not.toBeInTheDocument();
  });

  test('handles game type selection', async () => {
    render(
      <GameComponent 
        onGameChange={mockOnGameChange} 
        selectedGames={[]} 
        courseId="course1" 
      />
    );
    
    fireEvent.click(screen.getByText('Add Nassau'));
    await waitFor(() => {
      expect(mockOnGameChange).toHaveBeenCalled();
    });
  });
});
