import React from 'react';
import { 
  Box, 
  Container, 
  FormControl, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Select, 
  SelectChangeEvent,
  Paper
} from '@mui/material';
import { Player } from './PlayerForm';
import { BankerGame } from './BankerGame';
import type { GameType, GolfHole } from '../types/game';

interface GameProps {
  holes: GolfHole[];
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  currentHole: number;
  onCurrentHoleChange: (hole: number) => void;
  gameType: GameType;
  onGameTypeChange: (type: GameType) => void;
}

export const Game: React.FC<GameProps> = ({
  holes,
  players,
  scores,
  currentHole,
  onCurrentHoleChange,
  gameType,
  onGameTypeChange
}: GameProps) => {
  const handleGameTypeChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    if (value === 'banker' || value === 'mrpar' || value === 'wolf') {
      onGameTypeChange(value as GameType);
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {/* Game Type Selection */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Game Type</InputLabel>
                <Select
                  value={gameType}
                  onChange={handleGameTypeChange}
                  label="Game Type"
                >
                  <MenuItem value="banker">Banker</MenuItem>
                  <MenuItem value="mrpar">Mr. Par</MenuItem>
                  <MenuItem value="wolf">Wolf</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Game Type Specific Component */}
          {gameType === 'banker' && (
            <Grid item xs={12}>
              <BankerGame
                players={players}
                scores={scores}
                holes={holes}
                currentHole={currentHole}
                onCurrentHoleChange={onCurrentHoleChange}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};
