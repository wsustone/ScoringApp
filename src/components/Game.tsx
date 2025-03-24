import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { BankerGame } from './BankerGame';

export type GameType = 'banker' | 'mrpar' | 'wolf';

interface GameProps {
  playerCount: number;
  scores: { [key: string]: { [key: number]: number | null } };
  holes: { number: number; par: number; strokeIndex: number; distance: number; }[];
  holeSetups: { [key: number]: HoleSetup };
  onHoleSetupChange: (holeNumber: number, setup: Partial<HoleSetup>) => void;
}

interface HoleSetup {
  banker: number | null;
  dots: number;
  doubles: { [key: number]: boolean };
}

interface GameRule {
  name: string;
  description: string;
  minPlayers: number;
}

const gameRules: Record<GameType, GameRule> = {
  banker: {
    name: 'Banker',
    description: 'Each player takes turns being the banker. The banker plays against all other players individually for points.',
    minPlayers: 3,
  },
  mrpar: {
    name: 'Mr. Par',
    description: 'Players compete against par on each hole. Points are awarded for beating par and deducted for scoring over par.',
    minPlayers: 1,
  },
  wolf: {
    name: 'Wolf',
    description: 'One player (the Wolf) chooses a partner after watching tee shots. The Wolf can also choose to play alone for higher points.',
    minPlayers: 4,
  },
};

export const Game: React.FC<GameProps> = ({
  playerCount,
  scores,
  holes,
  holeSetups,
  onHoleSetupChange,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType | ''>('');

  const handleGameChange = (event: SelectChangeEvent<string>) => {
    setSelectedGame(event.target.value as GameType);
  };

  const getPlayerWarning = (game: GameType) => {
    const minPlayers = gameRules[game].minPlayers;
    if (playerCount < minPlayers) {
      return `This game requires at least ${minPlayers} players`;
    }
    return null;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Game Options
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Game</InputLabel>
          <Select
            value={selectedGame}
            label="Select Game"
            onChange={handleGameChange}
          >
            {Object.entries(gameRules).map(([value, { name }]) => (
              <MenuItem key={value} value={value}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedGame && (
          <Paper sx={{ p: 2, flex: 1, maxWidth: 600 }}>
            <Typography variant="subtitle1" gutterBottom>
              {gameRules[selectedGame].name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {gameRules[selectedGame].description}
            </Typography>
            {getPlayerWarning(selectedGame) && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {getPlayerWarning(selectedGame)}
              </Alert>
            )}
          </Paper>
        )}
      </Box>
      {selectedGame === 'banker' && (
        <BankerGame
          scores={scores}
          playerCount={playerCount}
          holes={holes}
          holeSetups={holeSetups}
          onHoleSetupChange={onHoleSetupChange}
        />
      )}
    </Box>
  );
};
