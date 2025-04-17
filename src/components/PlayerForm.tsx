import { useState } from 'react';
import { Box, Button, Grid, TextField, MenuItem, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { TeeSetting } from '../types/game';
import { PlayerRound } from '../types/player';

export interface Player {
  id: string;
  name: string;
  handicap: number;
  tee_id: string;
}

interface PlayerFormProps {
  onPlayersChange: (players: PlayerRound[]) => void;
  players: PlayerRound[];
  teeSettings: TeeSetting[];
}

export const PlayerForm = ({ onPlayersChange, players, teeSettings }: PlayerFormProps) => {
  const [newPlayer, setNewPlayer] = useState<Partial<PlayerRound>>({
    name: '',
    handicap: 0,
    tee_id: ''
  });

  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.tee_id) return;

    const player: PlayerRound = {
      id: Date.now().toString(),
      name: newPlayer.name,
      handicap: newPlayer.handicap || 0,
      tee_id: newPlayer.tee_id,
      round_id: players.length > 0 ? players[0].round_id : '',
      player_id: Date.now().toString(),
    };

    onPlayersChange([...players, player]);
    setNewPlayer({ name: '', handicap: 0, tee_id: '' });
  };

  const handleRemovePlayer = (index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    onPlayersChange(updatedPlayers);
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Name"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            type="number"
            label="Handicap"
            value={newPlayer.handicap}
            onChange={(e) => setNewPlayer({ ...newPlayer, handicap: parseInt(e.target.value) || 0 })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            select
            label="Tee"
            value={newPlayer.tee_id}
            onChange={(e) => setNewPlayer({ ...newPlayer, tee_id: e.target.value })}
          >
            {teeSettings.map((tee) => (
              <MenuItem key={tee.id} value={tee.id}>
                {tee.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddPlayer}
            disabled={!newPlayer.name || !newPlayer.tee_id}
          >
            Add Player
          </Button>
        </Grid>
      </Grid>

      {players.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {players.map((player, index) => (
              <Grid item xs={12} key={player.id}>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1}>
                    {player.name} - {teeSettings.find(t => t.id === player.tee_id)?.name} (HCP: {player.handicap})
                  </Box>
                  <IconButton onClick={() => handleRemovePlayer(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};
