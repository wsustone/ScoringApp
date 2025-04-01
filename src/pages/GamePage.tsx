import { Box } from '@mui/material';
import { Player } from '../components/PlayerForm';
import { GameComponent } from '../components/Game';
import { GameType, ExtendedGolfTee } from '../types/game';
import { useState } from 'react';

interface GamePageProps {
  availableTees: ExtendedGolfTee[];
  onPlayersChange: (players: Player[]) => void;
  onGamesChange: (games: GameType[]) => void;
}

export const GamePage = ({ availableTees, onPlayersChange, onGamesChange }: GamePageProps) => {
  const [players, setPlayers] = useState<Player[]>([]);

  const handleAddPlayer = (player: Player) => {
    const newPlayers = [...players, player];
    setPlayers(newPlayers);
    onPlayersChange(newPlayers);
  };

  const handleGameChange = (selectedGames: GameType[]) => {
    onGamesChange(selectedGames);
  };

  return (
    <Box>
      <GameComponent
        players={players}
        onGameChange={handleGameChange}
        onAddPlayer={handleAddPlayer}
        availableTees={availableTees}
      />
    </Box>
  );
};
