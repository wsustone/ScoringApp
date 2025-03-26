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
  Divider,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { BankerGame } from './BankerGame';
import { Player } from './PlayerForm';
import { GolfHole, HoleSetup } from '../types';

export type GameType = 'banker' | 'mrpar' | 'wolf';

interface GameProps {
  scores: { [key: string]: { [key: number]: number | null } };
  holes: GolfHole[];
  holeSetups: { [key: number]: HoleSetup };
  onHoleSetupChange: (holeNumber: number, setup: Partial<HoleSetup>) => void;
  players: Player[];
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
  scores,
  holes,
  holeSetups,
  onHoleSetupChange,
  players,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('banker');

  const handleGameChange = (event: SelectChangeEvent<string>) => {
    setSelectedGame(event.target.value as GameType);
  };

  const getPlayerWarning = (game: GameType) => {
    const minPlayers = gameRules[game].minPlayers;
    if (players.length < minPlayers) {
      return `This game requires at least ${minPlayers} players`;
    }
    return null;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="h6" gutterBottom>
            Game Options
          </Typography>
          <FormControl fullWidth>
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
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {gameRules[selectedGame].name}
            </Typography>
            <Typography variant="body1" paragraph>
              {gameRules[selectedGame].description}
            </Typography>
            {getPlayerWarning(selectedGame) && (
              <Alert severity="warning">
                {getPlayerWarning(selectedGame)}
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Game Setup
      </Typography>
      <Grid container spacing={3}>
        {holes.map((hole) => (
          <Grid item xs={12} sm={6} md={4} key={hole.number}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hole {hole.number}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Par {hole.par} | SI {hole.strokeIndex}
                </Typography>
                
                <TextField
                  label="Pin Position"
                  value={holeSetups[hole.number]?.pin || ''}
                  onChange={(e) => onHoleSetupChange(hole.number, { pin: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                
                <TextField
                  label="Tee Box"
                  value={holeSetups[hole.number]?.teeBox || ''}
                  onChange={(e) => onHoleSetupChange(hole.number, { teeBox: e.target.value })}
                  fullWidth
                  margin="normal"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={holeSetups[hole.number]?.banker || false}
                      onChange={(e) => onHoleSetupChange(hole.number, { banker: e.target.checked })}
                    />
                  }
                  label="Banker"
                />

                <TextField
                  label="Dots"
                  type="number"
                  value={holeSetups[hole.number]?.dots || ''}
                  onChange={(e) => onHoleSetupChange(hole.number, { dots: parseInt(e.target.value) || 0 })}
                  fullWidth
                  margin="normal"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={holeSetups[hole.number]?.doubles || false}
                      onChange={(e) => onHoleSetupChange(hole.number, { doubles: e.target.checked })}
                    />
                  }
                  label="Doubles"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedGame === 'banker' && !getPlayerWarning(selectedGame) && (
        <BankerGame
          scores={scores}
          holes={holes}
          holeSetups={holeSetups}
          onHoleSetupChange={onHoleSetupChange}
          players={players}
        />
      )}

      {selectedGame === 'banker' && getPlayerWarning(selectedGame) && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Add more players to start the Banker game
        </Typography>
      )}
    </Box>
  );
};
