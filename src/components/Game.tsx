import React, { useState } from 'react';
import { Box, Checkbox, FormControlLabel, FormGroup, TextField, Typography } from '@mui/material';
import { GameType, Game } from '../types/game';

interface GameComponentProps {
  onGameChange: (games: GameType[]) => void;
  selectedGames: Game[];
}

export const GameComponent: React.FC<GameComponentProps> = ({ onGameChange, selectedGames }) => {
  const availableGames: GameType[] = ['banker', 'nassau', 'skins'];
  const [bankerSettings, setBankerSettings] = useState({
    enabled: false,
    minDots: 1,
    maxDots: 4,
    dotValue: 1,
    doubleBirdieBets: true,
    useGrossBirdies: false,
    par3Triples: false,
  });
  const [nassauSettings, setNassauSettings] = useState({
    enabled: false,
    frontNinePoints: 0,
    backNinePoints: 0,
    matchPoints: 0,
  });
  const [skinsSettings, setSkinsSettings] = useState({
    enabled: false,
    pointsPerSkin: 1,
  });

  const handleGameChange = (game: GameType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    const newGames = checked
      ? [...selectedGames.map(g => g.type), game]
      : selectedGames.map(g => g.type).filter(g => g !== game);
    
    onGameChange(newGames);

    // Update settings enabled state
    switch (game) {
      case 'banker':
        setBankerSettings(prev => ({ ...prev, enabled: checked }));
        break;
      case 'nassau':
        setNassauSettings(prev => ({ ...prev, enabled: checked }));
        break;
      case 'skins':
        setSkinsSettings(prev => ({ ...prev, enabled: checked }));
        break;
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Select Games
      </Typography>
      <FormGroup>
        {availableGames.map((game) => (
          <FormControlLabel
            key={game}
            control={
              <Checkbox
                checked={selectedGames.some(g => g.type === game)}
                onChange={handleGameChange(game)}
              />
            }
            label={game.charAt(0).toUpperCase() + game.slice(1)}
          />
        ))}
      </FormGroup>

      {bankerSettings.enabled && (
        <Box sx={{ mt: 2, pl: 3 }}>
          <Typography variant="subtitle2">Banker Settings</Typography>
          <TextField
            label="Min Dots"
            type="number"
            value={bankerSettings.minDots}
            onChange={(e) => setBankerSettings(prev => ({ ...prev, minDots: parseInt(e.target.value) || 1 }))}
            size="small"
            sx={{ mr: 1 }}
          />
          <TextField
            label="Max Dots"
            type="number"
            value={bankerSettings.maxDots}
            onChange={(e) => setBankerSettings(prev => ({ ...prev, maxDots: parseInt(e.target.value) || 1 }))}
            size="small"
            sx={{ mr: 1 }}
          />
          <TextField
            label="Dot Value"
            type="number"
            value={bankerSettings.dotValue}
            onChange={(e) => setBankerSettings(prev => ({ ...prev, dotValue: parseInt(e.target.value) || 1 }))}
            size="small"
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={bankerSettings.doubleBirdieBets}
                  onChange={(e) => setBankerSettings(prev => ({ ...prev, doubleBirdieBets: e.target.checked }))}
                />
              }
              label="Double Birdie Bets"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={bankerSettings.useGrossBirdies}
                  onChange={(e) => setBankerSettings(prev => ({ ...prev, useGrossBirdies: e.target.checked }))}
                />
              }
              label="Use Gross Birdies"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={bankerSettings.par3Triples}
                  onChange={(e) => setBankerSettings(prev => ({ ...prev, par3Triples: e.target.checked }))}
                />
              }
              label="Par 3 Triples"
            />
          </FormGroup>
        </Box>
      )}

      {nassauSettings.enabled && (
        <Box sx={{ mt: 2, pl: 3 }}>
          <Typography variant="subtitle2">Nassau Settings</Typography>
          <TextField
            label="Front Nine Points"
            type="number"
            value={nassauSettings.frontNinePoints}
            onChange={(e) => setNassauSettings(prev => ({ ...prev, frontNinePoints: parseInt(e.target.value) || 0 }))}
            size="small"
            sx={{ mr: 1 }}
          />
          <TextField
            label="Back Nine Points"
            type="number"
            value={nassauSettings.backNinePoints}
            onChange={(e) => setNassauSettings(prev => ({ ...prev, backNinePoints: parseInt(e.target.value) || 0 }))}
            size="small"
            sx={{ mr: 1 }}
          />
          <TextField
            label="Match Points"
            type="number"
            value={nassauSettings.matchPoints}
            onChange={(e) => setNassauSettings(prev => ({ ...prev, matchPoints: parseInt(e.target.value) || 0 }))}
            size="small"
          />
        </Box>
      )}

      {skinsSettings.enabled && (
        <Box sx={{ mt: 2, pl: 3 }}>
          <Typography variant="subtitle2">Skins Settings</Typography>
          <TextField
            label="Points per Skin"
            type="number"
            value={skinsSettings.pointsPerSkin}
            onChange={(e) => setSkinsSettings(prev => ({ ...prev, pointsPerSkin: parseInt(e.target.value) || 1 }))}
            size="small"
          />
        </Box>
      )}
    </Box>
  );
};
