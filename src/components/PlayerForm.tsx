import React, { useState } from 'react';
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Grid, Typography } from '@mui/material';
import { TeeSetting } from '../types/game';

export interface Player {
  id: string;
  name: string;
  tee_id: string;
  handicap: number;
}

interface PlayerFormProps {
  onPlayersChange: (players: Player[]) => void;
  players: Player[];
  tee_settings: TeeSetting[];
}

export const PlayerForm: React.FC<PlayerFormProps> = ({
  onPlayersChange,
  players,
  tee_settings,
}) => {
  const [name, setName] = useState('');
  const [selectedTeeId, setSelectedTeeId] = useState('');
  const [handicap, setHandicap] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && selectedTeeId) {
      const newPlayer: Player = {
        id: Math.random().toString(36).substring(7), // Generate a random ID
        name,
        tee_id: selectedTeeId,
        handicap,
      };

      const updatedPlayers = [...players, newPlayer];
      onPlayersChange(updatedPlayers);

      // Reset form
      setName('');
      setSelectedTeeId('');
      setHandicap(0);
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    const updatedPlayers = players.filter((p) => p.id !== playerId);
    onPlayersChange(updatedPlayers);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Add Players
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Player Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Tee</InputLabel>
            <Select
              value={selectedTeeId}
              onChange={(e) => setSelectedTeeId(e.target.value)}
              label="Tee"
            >
              {tee_settings.map((tee) => (
                <MenuItem key={tee.id} value={tee.id}>
                  {tee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            type="number"
            label="Handicap"
            value={handicap}
            onChange={(e) => setHandicap(parseInt(e.target.value) || 0)}
            inputProps={{ min: 0, max: 54 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ height: '100%' }}
          >
            Add Player
          </Button>
        </Grid>
      </Grid>

      {players.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Players in Round:
          </Typography>
          <Grid container spacing={1}>
            {players.map((player) => (
              <Grid item xs={12} key={player.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>
                    {player.name} - {tee_settings.find(t => t.id === player.tee_id)?.name} (HCP: {player.handicap})
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemovePlayer(player.id)}
                  >
                    Remove
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};
