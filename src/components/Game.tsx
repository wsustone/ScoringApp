import React, { useState } from 'react';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Typography, Divider, TextField, Switch, FormControlLabel } from '@mui/material';
import { Player } from './PlayerForm';
import { GameType, GameOptions } from '../types/game';

interface GameProps {
  players: Player[];
  selectedGames: GameType[];
  onGameChange: (games: GameType[]) => void;
}

export const Game: React.FC<GameProps> = ({ players, selectedGames, onGameChange }) => {
  const [gameOptions, setGameOptions] = useState<GameOptions>({
    banker: {
      pointsPerDollar: 1,
      carryOver: true,
      doubleBirdieBets: true,
      useGrossBirdies: false,
      par3Triples: false,
      holeData: []
    },
    mrpar: {
      pointsPerHole: 1,
      allowTies: false,
    },
    wolf: {
      pointsPerHole: 2,
      allowLoneWolf: true,
    },
    nassau: {
      frontNineAmount: 2,
      backNineAmount: 2,
      matchAmount: 2,
      autoPress: true,
      pressEvery: 2,
      carryOver: true,
    },
    skins: {
      skinAmount: 1,
      carryOver: true,
    }
  });

  const handleGameChange = (event: SelectChangeEvent<GameType[]>) => {
    const value = event.target.value;
    const games = typeof value === 'string' ? [value as GameType] : value as GameType[];
    onGameChange(games);
  };

  const handleOptionChange = <T extends keyof GameOptions>(
    game: T,
    option: keyof GameOptions[T],
    value: any
  ) => {
    setGameOptions(prev => ({
      ...prev,
      [game]: {
        ...prev[game],
        [option]: value,
      },
    }));
  };

  const gameOptionsList: { value: GameType; label: string }[] = [
    { value: 'banker', label: 'Banker' },
    { value: 'mrpar', label: 'Mr. Par' },
    { value: 'wolf', label: 'Wolf' },
    { value: 'nassau', label: 'Nassau' },
    { value: 'skins', label: 'Skins' },
  ];

  const renderGameOptions = (gameType: GameType) => {
    switch (gameType) {
      case 'banker':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Banker Options</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  label="Points per Dollar"
                  value={gameOptions.banker.pointsPerDollar}
                  onChange={(e) => handleOptionChange('banker', 'pointsPerDollar', Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameOptions.banker.carryOver}
                      onChange={(e) => handleOptionChange('banker', 'carryOver', e.target.checked)}
                    />
                  }
                  label="Carry Over Points"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameOptions.banker.doubleBirdieBets}
                      onChange={(e) => handleOptionChange('banker', 'doubleBirdieBets', e.target.checked)}
                    />
                  }
                  label="Double Birdie Bets"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameOptions.banker.useGrossBirdies}
                      onChange={(e) => handleOptionChange('banker', 'useGrossBirdies', e.target.checked)}
                    />
                  }
                  label="Use Gross Birdies"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameOptions.banker.par3Triples}
                      onChange={(e) => handleOptionChange('banker', 'par3Triples', e.target.checked)}
                    />
                  }
                  label="Par 3 Triples"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 'mrpar':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Mr. Par Options</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  label="Points per Hole"
                  value={gameOptions.mrpar.pointsPerHole}
                  onChange={(e) => handleOptionChange('mrpar', 'pointsPerHole', Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameOptions.mrpar.allowTies}
                      onChange={(e) => handleOptionChange('mrpar', 'allowTies', e.target.checked)}
                    />
                  }
                  label="Allow Ties"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 'wolf':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Wolf Options</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  label="Points per Hole"
                  value={gameOptions.wolf.pointsPerHole}
                  onChange={(e) => handleOptionChange('wolf', 'pointsPerHole', Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameOptions.wolf.allowLoneWolf}
                      onChange={(e) => handleOptionChange('wolf', 'allowLoneWolf', e.target.checked)}
                    />
                  }
                  label="Allow Lone Wolf"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 'nassau':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Nassau Options</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  label="Front Nine Amount"
                  value={gameOptions.nassau.frontNineAmount}
                  onChange={(e) => handleOptionChange('nassau', 'frontNineAmount', Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  label="Back Nine Amount"
                  value={gameOptions.nassau.backNineAmount}
                  onChange={(e) => handleOptionChange('nassau', 'backNineAmount', Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  label="Match Amount"
                  value={gameOptions.nassau.matchAmount}
                  onChange={(e) => handleOptionChange('nassau', 'matchAmount', Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameOptions.nassau.autoPress}
                      onChange={(e) => handleOptionChange('nassau', 'autoPress', e.target.checked)}
                    />
                  }
                  label="Auto Press"
                />
              </Grid>
              {gameOptions.nassau.autoPress && (
                <Grid item xs={12}>
                  <TextField
                    type="number"
                    label="Press Every"
                    value={gameOptions.nassau.pressEvery}
                    onChange={(e) => handleOptionChange('nassau', 'pressEvery', Number(e.target.value))}
                    fullWidth
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameOptions.nassau.carryOver}
                      onChange={(e) => handleOptionChange('nassau', 'carryOver', e.target.checked)}
                    />
                  }
                  label="Carry Over"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 'skins':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Skins Options</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="number"
                  label="Skin Amount"
                  value={gameOptions.skins.skinAmount}
                  onChange={(e) => handleOptionChange('skins', 'skinAmount', Number(e.target.value))}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameOptions.skins.carryOver}
                      onChange={(e) => handleOptionChange('skins', 'carryOver', e.target.checked)}
                    />
                  }
                  label="Carry Over"
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="game-types-label">Game Types</InputLabel>
            <Select
              labelId="game-types-label"
              id="game-types"
              multiple
              value={selectedGames}
              onChange={handleGameChange}
              label="Game Types"
              renderValue={(selected) => (
                selected.map(game => gameOptionsList.find(opt => opt.value === game)?.label).join(', ')
              )}
            >
              {gameOptionsList.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {selectedGames.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Selected Players
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {players.map(p => p.name).join(', ')}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {selectedGames.map((gameType) => (
              <React.Fragment key={gameType}>
                {renderGameOptions(gameType)}
                {gameType !== selectedGames[selectedGames.length - 1] && (
                  <Divider sx={{ my: 3 }} />
                )}
              </React.Fragment>
            ))}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
