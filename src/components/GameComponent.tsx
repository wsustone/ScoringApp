import React from 'react';
import { Box, Typography, TextField, Switch, FormControlLabel, Grid, Card, CardContent, Button } from '@mui/material';
import { Game, GameType } from '../types/game';

interface GameComponentProps {
  onGameChange: (games: Game[]) => void;
  selectedGames: Game[];
  courseId: string;
}

export const GameComponent: React.FC<GameComponentProps> = ({ onGameChange, selectedGames, courseId }) => {
  const handleGameSelect = (type: GameType) => {
    // Check if game type already exists
    if (selectedGames.some(game => game.type === type)) {
      return;
    }

    let newGame: Game;
    const id = Math.random().toString(36).substring(7);
    const roundId = '';  // This will be set when the round is created
    // Removed hardcoded empty courseId
    
    switch (type) {
      case 'banker':
        newGame = {
          id,
          type: 'banker',
          round_id: roundId,
          course_id: courseId,
          enabled: true,
          settings: {
            banker: {
              min_dots: 1,
              max_dots: 3,
              dot_value: 1,
              double_birdie_bets: false,
              use_gross_birdies: false,
              par3_triples: false
            }
          }
        };
        break;
      case 'nassau':
        newGame = {
          id,
          type: 'nassau',
          round_id: roundId,
          course_id: courseId,
          enabled: true,
          settings: {
            nassau: {
              front_nine_bet: 2,
              back_nine_bet: 2,
              match_bet: 2,
              auto_press: false,
              press_after: 2
            }
          }
        };
        break;
      case 'skins':
        newGame = {
          id,
          type: 'skins',
          round_id: roundId,
          course_id: courseId,
          enabled: true,
          settings: {
            skins: {
              bet_amount: 1,
              carry_over: true
            }
          }
        };
        break;
      default:
        return;
    }

    onGameChange([...selectedGames, newGame]);
  };

  const handleGameToggle = (gameId: string) => {
    const updatedGames = selectedGames.map(game =>
      game.id === gameId ? { ...game, enabled: !game.enabled } : game
    );
    onGameChange(updatedGames);
  };

  const handleSettingChange = (gameId: string, settingPath: string[], value: any) => {
    const updatedGames = selectedGames.map(game => {
      if (game.id !== gameId) return game;

      const updatedGame = { ...game };
      let current: any = updatedGame;
      
      // Navigate to the correct setting
      for (let i = 0; i < settingPath.length - 1; i++) {
        if (!current[settingPath[i]]) {
          current[settingPath[i]] = {};
        }
        current = current[settingPath[i]];
      }
      
      // Update the value
      current[settingPath[settingPath.length - 1]] = value;
      return updatedGame;
    });

    onGameChange(updatedGames);
  };

  const renderBankerSettings = (game: Game) => {
    const settings = game.settings?.banker;
    if (!settings) return null;

    return (
      <Box>
        <TextField
          label="Min Dots"
          type="number"
          value={settings.min_dots}
          onChange={(e) => handleSettingChange(game.id, ['settings', 'banker', 'min_dots'], parseInt(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Max Dots"
          type="number"
          value={settings.max_dots}
          onChange={(e) => handleSettingChange(game.id, ['settings', 'banker', 'max_dots'], parseInt(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Dot Value"
          type="number"
          value={settings.dot_value}
          onChange={(e) => handleSettingChange(game.id, ['settings', 'banker', 'dot_value'], parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.double_birdie_bets}
              onChange={(e) => handleSettingChange(game.id, ['settings', 'banker', 'double_birdie_bets'], e.target.checked)}
            />
          }
          label="Double Birdie Bets"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.use_gross_birdies}
              onChange={(e) => handleSettingChange(game.id, ['settings', 'banker', 'use_gross_birdies'], e.target.checked)}
            />
          }
          label="Use Gross Birdies"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.par3_triples}
              onChange={(e) => handleSettingChange(game.id, ['settings', 'banker', 'par3_triples'], e.target.checked)}
            />
          }
          label="Par 3 Triples"
        />
      </Box>
    );
  };

  const renderNassauSettings = (game: Game) => {
    const settings = game.settings?.nassau;
    if (!settings) return null;

    return (
      <Box>
        <TextField
          label="Front Nine Bet"
          type="number"
          value={settings.front_nine_bet}
          onChange={(e) => handleSettingChange(game.id, ['settings', 'nassau', 'front_nine_bet'], parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Back Nine Bet"
          type="number"
          value={settings.back_nine_bet}
          onChange={(e) => handleSettingChange(game.id, ['settings', 'nassau', 'back_nine_bet'], parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Match Bet"
          type="number"
          value={settings.match_bet}
          onChange={(e) => handleSettingChange(game.id, ['settings', 'nassau', 'match_bet'], parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.auto_press}
              onChange={(e) => handleSettingChange(game.id, ['settings', 'nassau', 'auto_press'], e.target.checked)}
            />
          }
          label="Auto Press"
        />
        {settings.auto_press && (
          <TextField
            label="Press After"
            type="number"
            value={settings.press_after}
            onChange={(e) => handleSettingChange(game.id, ['settings', 'nassau', 'press_after'], parseInt(e.target.value))}
            fullWidth
            margin="normal"
          />
        )}
      </Box>
    );
  };

  const renderSkinsSettings = (game: Game) => {
    const settings = game.settings?.skins;
    if (!settings) return null;

    return (
      <Box>
        <TextField
          label="Bet Amount"
          type="number"
          value={settings.bet_amount}
          onChange={(e) => handleSettingChange(game.id, ['settings', 'skins', 'bet_amount'], parseFloat(e.target.value))}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.carry_over}
              onChange={(e) => handleSettingChange(game.id, ['settings', 'skins', 'carry_over'], e.target.checked)}
            />
          }
          label="Carry Over"
        />
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Games
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={() => handleGameSelect('banker')}
            disabled={selectedGames.some(g => g.type === 'banker')}
          >
            Add Banker
          </Button>
          <Button
            variant="contained"
            onClick={() => handleGameSelect('nassau')}
            disabled={selectedGames.some(g => g.type === 'nassau')}
            sx={{ ml: 1 }}
          >
            Add Nassau
          </Button>
          <Button
            variant="contained"
            onClick={() => handleGameSelect('skins')}
            disabled={selectedGames.some(g => g.type === 'skins')}
            sx={{ ml: 1 }}
          >
            Add Skins
          </Button>
        </Grid>
        {selectedGames.map(game => (
          <Grid item xs={12} key={game.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {game.type.charAt(0).toUpperCase() + game.type.slice(1)}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={game.enabled}
                        onChange={() => handleGameToggle(game.id)}
                      />
                    }
                    label="Enabled"
                  />
                </Box>
                {game.type === 'banker' && renderBankerSettings(game)}
                {game.type === 'nassau' && renderNassauSettings(game)}
                {game.type === 'skins' && renderSkinsSettings(game)}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
