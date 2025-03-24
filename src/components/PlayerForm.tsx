import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export interface Player {
  id: string;
  name: string;
  handicap: number;
}

interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ players, onPlayersChange }) => {
  const [error, setError] = useState<string | null>(null);

  const handleAddPlayer = () => {
    if (players.length >= 4) {
      setError('Maximum 4 players allowed');
      return;
    }
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: '',
      handicap: 0,
    };
    
    onPlayersChange([...players, newPlayer]);
    setError(null);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 1) {
      setError('Minimum 1 player required');
      return;
    }
    onPlayersChange(players.filter(p => p.id !== id));
    setError(null);
  };

  const handlePlayerChange = (id: string, field: keyof Player, value: string) => {
    const updatedPlayers = players.map(player => {
      if (player.id === id) {
        if (field === 'handicap') {
          return { ...player, [field]: parseInt(value) || 0 };
        }
        return { ...player, [field]: value };
      }
      return player;
    });

    // Check for duplicate names
    const names = updatedPlayers.map(p => p.name.trim().toLowerCase());
    const hasDuplicates = names.some((name, index) => 
      name !== '' && names.indexOf(name) !== index
    );

    if (hasDuplicates) {
      setError('Player names must be unique');
    } else {
      setError(null);
      onPlayersChange(updatedPlayers);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Players</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddPlayer}
          disabled={players.length >= 4}
          variant="contained"
          size="small"
        >
          Add Player
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {players.map((player, index) => (
          <Paper key={player.id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
                Player {index + 1}
              </Typography>
              <TextField
                label="Name"
                value={player.name}
                onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                size="small"
                required
                error={!player.name.trim()}
                helperText={!player.name.trim() ? 'Name is required' : ''}
              />
              <TextField
                label="Handicap"
                type="number"
                value={player.handicap}
                onChange={(e) => handlePlayerChange(player.id, 'handicap', e.target.value)}
                size="small"
                inputProps={{ min: 0, max: 54 }}
                sx={{ width: 100 }}
              />
              <IconButton
                onClick={() => handleRemovePlayer(player.id)}
                disabled={players.length <= 1}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};
