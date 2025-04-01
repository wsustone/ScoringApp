import { useState } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Grid } from '@mui/material';

export interface Player {
  id: string;
  name: string;
  handicap: number | null;
  teeId: string;
}

interface GolfTee {
  id: string;
  name: string;
  gender: string;
  courseRating: number;
  slopeRating: number;
}

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void;
  tees: GolfTee[];
  players: Player[];
}

export const PlayerForm = ({ onAddPlayer, tees, players }: PlayerFormProps) => {
  const [name, setName] = useState('');
  const [handicap, setHandicap] = useState('');
  const [selectedTeeId, setSelectedTeeId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedTeeId) return;

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: name.trim(),
      handicap: handicap ? parseFloat(handicap) : null,
      teeId: selectedTeeId,
    };

    onAddPlayer(newPlayer);
    setName('');
    setHandicap('');
    setSelectedTeeId('');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add Players
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Player Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Handicap"
              type="number"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              inputProps={{ step: '0.1', min: '0', max: '54' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel id="tee-select-label">Select Tee</InputLabel>
              <Select
                labelId="tee-select-label"
                value={selectedTeeId}
                label="Select Tee"
                onChange={(e) => setSelectedTeeId(e.target.value)}
              >
                {tees.map((tee) => (
                  <MenuItem key={tee.id} value={tee.id}>
                    {tee.name} ({tee.gender}) - CR: {tee.courseRating}, SR: {tee.slopeRating}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!name.trim() || !selectedTeeId}
            >
              Add Player
            </Button>
          </Grid>
        </Grid>
      </Box>

      {players.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Current Players
          </Typography>
          <Grid container spacing={2}>
            {players.map((player) => {
              const playerTee = tees.find(t => t.id === player.teeId);
              return (
                <Grid item xs={12} sm={6} md={4} key={player.id}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Typography variant="subtitle1">
                      {player.name}
                    </Typography>
                    {player.handicap !== null && (
                      <Typography variant="body2" color="textSecondary">
                        Handicap: {player.handicap}
                      </Typography>
                    )}
                    {playerTee && (
                      <Typography variant="body2" color="textSecondary">
                        {playerTee.name} ({playerTee.gender})
                      </Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
};
