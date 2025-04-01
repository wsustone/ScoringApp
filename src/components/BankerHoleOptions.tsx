import React from 'react';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Switch, FormControlLabel } from '@mui/material';
import { Player } from './PlayerForm';
import { BankerHoleData } from '../types/game';

interface BankerHoleOptionsProps {
  players: Player[];
  currentHole: number;
  holeId: string;
  bankerData: BankerHoleData | null;
  onBankerDataChange: (data: BankerHoleData) => void;
}

export const BankerHoleOptions: React.FC<BankerHoleOptionsProps> = ({
  players,
  currentHole,
  holeId,
  bankerData,
  onBankerDataChange,
}) => {
  const handleBankerChange = (bankerId: string) => {
    onBankerDataChange({
      holeId,
      bankerId,
      dots: bankerData?.dots || 1,
      doubles: bankerData?.doubles || players.map(p => ({ playerId: p.id, isDoubled: false })),
    });
  };

  const handleDotsChange = (dots: number) => {
    if (!bankerData?.bankerId) return;
    onBankerDataChange({
      ...bankerData,
      dots,
    });
  };

  const handleDoubleChange = (playerId: string, isDoubled: boolean) => {
    if (!bankerData?.bankerId) return;
    const doubles = bankerData.doubles.map(d => 
      d.playerId === playerId ? { ...d, isDoubled } : d
    );
    onBankerDataChange({
      ...bankerData,
      doubles,
    });
  };

  return (
    <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="banker-select-label">Banker for Hole {currentHole}</InputLabel>
            <Select
              labelId="banker-select-label"
              value={bankerData?.bankerId || ''}
              onChange={(e) => handleBankerChange(e.target.value)}
              label={`Banker for Hole ${currentHole}`}
            >
              {players.map((player) => (
                <MenuItem key={player.id} value={player.id}>
                  {player.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {bankerData?.bankerId && (
          <>
            <Grid item xs={12}>
              <TextField
                type="number"
                label="Points for this Hole"
                value={bankerData.dots}
                onChange={(e) => handleDotsChange(Number(e.target.value))}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              {players
                .filter(p => p.id !== bankerData.bankerId)
                .map((player) => (
                  <FormControlLabel
                    key={player.id}
                    control={
                      <Switch
                        checked={bankerData.doubles.find(d => d.playerId === player.id)?.isDoubled || false}
                        onChange={(e) => handleDoubleChange(player.id, e.target.checked)}
                      />
                    }
                    label={`${player.name} Doubles`}
                  />
                ))}
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};
