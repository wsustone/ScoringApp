import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ExtendedGolfTee } from '../types/game';

export interface Player {
  id: string;
  name: string;
  handicap: number;
  tee: ExtendedGolfTee;
}

interface PlayerFormProps {
  onSubmit?: (player: Player) => void;
  onAddPlayer?: (player: Player) => void;
  availableTees: ExtendedGolfTee[];
}

export const PlayerForm = ({ onSubmit, onAddPlayer, availableTees }: PlayerFormProps) => {
  const [name, setName] = useState('');
  const [handicap, setHandicap] = useState('');
  const [selectedTee, setSelectedTee] = useState<ExtendedGolfTee | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !handicap || !selectedTee) return;

    const player: Player = {
      id: `${name}-${Date.now()}`,
      name,
      handicap: parseFloat(handicap),
      tee: selectedTee
    };

    if (onSubmit) onSubmit(player);
    if (onAddPlayer) onAddPlayer(player);
    setName('');
    setHandicap('');
    setSelectedTee(null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Add Player
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Handicap"
          type="number"
          value={handicap}
          onChange={(e) => setHandicap(e.target.value)}
          required
          fullWidth
          inputProps={{
            step: 0.1,
            min: 0,
            max: 36,
          }}
        />
        <FormControl fullWidth required>
          <InputLabel>Tee</InputLabel>
          <Select
            value={selectedTee?.id || ''}
            onChange={(e) => {
              const tee = availableTees.find(t => t.id === e.target.value);
              setSelectedTee(tee || null);
            }}
            label="Tee"
          >
            {availableTees.map((tee) => (
              <MenuItem key={tee.id} value={tee.id}>
                {tee.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          disabled={!name || !handicap || !selectedTee}
        >
          Add Player
        </Button>
      </Box>
    </Box>
  );
};
