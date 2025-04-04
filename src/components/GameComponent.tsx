import React, { useState } from 'react';
import { Box, Button, Typography, Grid, TextField, FormControlLabel, Switch } from '@mui/material';
import { GameType, Game, BankerSettings, NassauSettings, SkinsSettings, BankerGame, NassauGame, SkinsGame } from '../types/game';

interface GameComponentProps {
  onGameChange: (games: Game[]) => void;
  selectedGames: Game[];
}

export const GameComponent: React.FC<GameComponentProps> = ({ onGameChange, selectedGames }) => {
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);

  const handleGameSelect = (game: GameType) => {
    setSelectedGameType(game);
    if (!selectedGames.some(g => g.type === game)) {
      let newGame: Game;
      const baseGame = {
        id: Math.random().toString(36).substring(7),
        type: game,
        round_id: '',
        course_id: '',
        enabled: true,
      };

      switch (game) {
        case 'banker':
          newGame = {
            ...baseGame,
            settings: {
              banker: {
                min_dots: 1,
                max_dots: 3,
                dot_value: 1,
                double_birdie_bets: false,
                use_gross_birdies: false,
                par3_triples: false,
              }
            },
            banker_data: { holes: [] }
          } as BankerGame;
          break;
        case 'nassau':
          newGame = {
            ...baseGame,
            settings: {
              nassau: {
                front_nine_bet: 2,
                back_nine_bet: 2,
                match_bet: 4,
                auto_press: false,
                press_after: 2,
              }
            },
            nassau_data: {
              front_nine: { winner: null, points: 0 },
              back_nine: { winner: null, points: 0 },
              match: { winner: null, points: 0 }
            }
          } as NassauGame;
          break;
        case 'skins':
          newGame = {
            ...baseGame,
            settings: {
              skins: {
                bet_amount: 1,
                carry_over: false,
              }
            },
            skins_data: { holes: [] }
          } as SkinsGame;
          break;
      }

      onGameChange([...selectedGames, newGame]);
    }
  };

  const handleGameSettingsChange = (game: GameType, settings: Partial<BankerSettings | NassauSettings | SkinsSettings>) => {
    const updatedGames = selectedGames.map(g => {
      if (g.type === game) {
        switch (game) {
          case 'banker':
            return {
              ...g,
              settings: {
                banker: {
                  ...((g as any).settings.banker),
                  ...settings as BankerSettings
                }
              }
            } as any;
          case 'nassau':
            return {
              ...g,
              settings: {
                nassau: {
                  ...((g as any).settings.nassau),
                  ...settings as NassauSettings
                }
              }
            } as any;
          case 'skins':
            return {
              ...g,
              settings: {
                skins: {
                  ...((g as any).settings.skins),
                  ...settings as SkinsSettings
                }
              }
            } as any;
        }
      }
      return g;
    });
    onGameChange(updatedGames);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Games
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant={selectedGameType === 'banker' ? 'contained' : 'outlined'}
              onClick={() => handleGameSelect('banker')}
            >
              Banker
            </Button>
            <Button
              variant={selectedGameType === 'nassau' ? 'contained' : 'outlined'}
              onClick={() => handleGameSelect('nassau')}
            >
              Nassau
            </Button>
            <Button
              variant={selectedGameType === 'skins' ? 'contained' : 'outlined'}
              onClick={() => handleGameSelect('skins')}
            >
              Skins
            </Button>
          </Box>
        </Grid>

        {selectedGameType === 'banker' && (
          <Grid item xs={12}>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>Banker Settings</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Min Dots"
                    type="number"
                    value={selectedGames.find(g => g.type === 'banker')?.settings.banker.min_dots || 1}
                    onChange={(e) => handleGameSettingsChange('banker', {
                      min_dots: parseInt(e.target.value)
                    })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Dots"
                    type="number"
                    value={selectedGames.find(g => g.type === 'banker')?.settings.banker.max_dots || 3}
                    onChange={(e) => handleGameSettingsChange('banker', {
                      max_dots: parseInt(e.target.value)
                    })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Dot Value"
                    type="number"
                    value={selectedGames.find(g => g.type === 'banker')?.settings.banker.dot_value || 1}
                    onChange={(e) => handleGameSettingsChange('banker', {
                      dot_value: parseInt(e.target.value)
                    })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedGames.find(g => g.type === 'banker')?.settings.banker.double_birdie_bets || false}
                        onChange={(e) => handleGameSettingsChange('banker', {
                          double_birdie_bets: e.target.checked
                        })}
                      />
                    }
                    label="Double Birdie Bets"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedGames.find(g => g.type === 'banker')?.settings.banker.use_gross_birdies || false}
                        onChange={(e) => handleGameSettingsChange('banker', {
                          use_gross_birdies: e.target.checked
                        })}
                      />
                    }
                    label="Use Gross Birdies"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedGames.find(g => g.type === 'banker')?.settings.banker.par3_triples || false}
                        onChange={(e) => handleGameSettingsChange('banker', {
                          par3_triples: e.target.checked
                        })}
                      />
                    }
                    label="Par 3 Triples"
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}

        {selectedGameType === 'nassau' && (
          <Grid item xs={12}>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>Nassau Settings</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Front Nine Bet"
                    type="number"
                    value={selectedGames.find(g => g.type === 'nassau')?.settings.nassau.front_nine_bet || 2}
                    onChange={(e) => handleGameSettingsChange('nassau', {
                      front_nine_bet: parseInt(e.target.value)
                    })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Back Nine Bet"
                    type="number"
                    value={selectedGames.find(g => g.type === 'nassau')?.settings.nassau.back_nine_bet || 2}
                    onChange={(e) => handleGameSettingsChange('nassau', {
                      back_nine_bet: parseInt(e.target.value)
                    })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Match Bet"
                    type="number"
                    value={selectedGames.find(g => g.type === 'nassau')?.settings.nassau.match_bet || 4}
                    onChange={(e) => handleGameSettingsChange('nassau', {
                      match_bet: parseInt(e.target.value)
                    })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedGames.find(g => g.type === 'nassau')?.settings.nassau.auto_press || false}
                        onChange={(e) => handleGameSettingsChange('nassau', {
                          auto_press: e.target.checked
                        })}
                      />
                    }
                    label="Auto Press"
                  />
                </Grid>
                {selectedGames.find(g => g.type === 'nassau')?.settings.nassau.auto_press && (
                  <Grid item xs={12}>
                    <TextField
                      label="Press After"
                      type="number"
                      value={selectedGames.find(g => g.type === 'nassau')?.settings.nassau.press_after || 2}
                      onChange={(e) => handleGameSettingsChange('nassau', {
                        press_after: parseInt(e.target.value)
                      })}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        )}

        {selectedGameType === 'skins' && (
          <Grid item xs={12}>
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>Skins Settings</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Bet Amount"
                    type="number"
                    value={selectedGames.find(g => g.type === 'skins')?.settings.skins.bet_amount || 1}
                    onChange={(e) => handleGameSettingsChange('skins', {
                      bet_amount: parseInt(e.target.value)
                    })}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedGames.find(g => g.type === 'skins')?.settings.skins.carry_over || false}
                        onChange={(e) => handleGameSettingsChange('skins', {
                          carry_over: e.target.checked
                        })}
                      />
                    }
                    label="Carry Over"
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
