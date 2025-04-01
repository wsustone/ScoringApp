import React, { useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, SelectChangeEvent } from '@mui/material';
import { Player } from './PlayerForm';
import { HoleData } from '../types/game';

interface BankerHoleOptionsProps {
  players: Player[];
  holeNumber: number;
  currentData: HoleData;
  onDataChange: (data: HoleData) => void;
}

export const BankerHoleOptions: React.FC<BankerHoleOptionsProps> = ({
  players,
  holeNumber,
  currentData,
  onDataChange,
}) => {
  const [points, setPoints] = useState<number>(currentData.points);
  const [winner, setWinner] = useState<string | null>(currentData.winner);

  const handlePointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPoints = parseInt(event.target.value, 10);
    if (newPoints > 0) {
      setPoints(newPoints);
      if (winner) {
        onDataChange({
          winner,
          points: newPoints,
        });
      }
    }
  };

  const handleWinnerChange = (event: SelectChangeEvent<string>) => {
    const newWinner = event.target.value;
    setWinner(newWinner);
    onDataChange({
      winner: newWinner,
      points,
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Banker Options - Hole {holeNumber}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id={`banker-winner-label-${holeNumber}`}>Winner</InputLabel>
          <Select
            labelId={`banker-winner-label-${holeNumber}`}
            value={winner || ''}
            onChange={handleWinnerChange}
            label="Winner"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {players.map((player) => (
              <MenuItem key={player.id} value={player.id}>
                {player.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          type="number"
          label="Points"
          value={points}
          onChange={handlePointsChange}
          inputProps={{ min: 1 }}
          sx={{ width: 100 }}
        />
      </Box>
    </Box>
  );
};
