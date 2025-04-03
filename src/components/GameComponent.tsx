import React from 'react';
import { Button, Card, CardContent, Typography, Box, TextField, FormControlLabel, Switch } from '@mui/material';
import { Game, GameType, BankerGame, NassauGame, SkinsGame } from '../types/game';

export interface GameComponentProps {
  selectedGames: Game[];
  onRemoveGame: (game: Game) => void;
  onAddGame: (type: GameType) => void;
  onUpdateGame: (updatedGame: Game) => void;
}

export const GameComponent: React.FC<GameComponentProps> = ({
  selectedGames,
  onRemoveGame,
  onAddGame,
  onUpdateGame,
}) => {
  const handleRemoveGame = (gameToRemove: Game) => {
    onRemoveGame(gameToRemove);
  };

  const handleUpdateBankerGame = (game: BankerGame, field: keyof BankerGame, value: any) => {
    onUpdateGame({
      ...game,
      [field]: field === 'dot_value' || field === 'min_dots' || field === 'max_dots'
        ? parseFloat(value)
        : value
    });
  };

  const handleUpdateNassauGame = (game: NassauGame, field: keyof NassauGame, value: any) => {
    onUpdateGame({
      ...game,
      [field]: field === 'front_nine_bet' || field === 'back_nine_bet' || field === 'match_bet'
        ? parseFloat(value)
        : value,
      nassau_data: game.nassau_data
    });
  };

  const handleUpdateSkinsGame = (game: SkinsGame, field: keyof SkinsGame, value: any) => {
    onUpdateGame({
      ...game,
      [field]: field === 'bet_amount' ? parseFloat(value) : value,
      skins_data: game.skins_data
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Games
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => onAddGame('banker')}
          disabled={selectedGames.some(game => game.type === 'banker')}
        >
          Add Banker
        </Button>
        <Button
          variant="outlined"
          onClick={() => onAddGame('nassau')}
          disabled={selectedGames.some(game => game.type === 'nassau')}
        >
          Add Nassau
        </Button>
        <Button
          variant="outlined"
          onClick={() => onAddGame('skins')}
          disabled={selectedGames.some(game => game.type === 'skins')}
        >
          Add Skins
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {selectedGames.map(game => (
          <Card key={game.id} sx={{ minWidth: 275, maxWidth: 350 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {game.type.charAt(0).toUpperCase() + game.type.slice(1)}
              </Typography>
              {game.type === 'banker' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Min Dots"
                    type="number"
                    value={(game as BankerGame).min_dots}
                    onChange={(e) => handleUpdateBankerGame(game as BankerGame, 'min_dots', e.target.value)}
                    size="small"
                  />
                  <TextField
                    label="Max Dots"
                    type="number"
                    value={(game as BankerGame).max_dots}
                    onChange={(e) => handleUpdateBankerGame(game as BankerGame, 'max_dots', e.target.value)}
                    size="small"
                  />
                  <TextField
                    label="Dot Value ($)"
                    type="number"
                    value={(game as BankerGame).dot_value}
                    onChange={(e) => handleUpdateBankerGame(game as BankerGame, 'dot_value', e.target.value)}
                    size="small"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={(game as BankerGame).double_birdie_bets}
                        onChange={(e) => handleUpdateBankerGame(game as BankerGame, 'double_birdie_bets', e.target.checked)}
                      />
                    }
                    label="Double Birdie Bets"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={(game as BankerGame).use_gross_birdies}
                        onChange={(e) => handleUpdateBankerGame(game as BankerGame, 'use_gross_birdies', e.target.checked)}
                      />
                    }
                    label="Use Gross Birdies"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={(game as BankerGame).par3_triples}
                        onChange={(e) => handleUpdateBankerGame(game as BankerGame, 'par3_triples', e.target.checked)}
                      />
                    }
                    label="Par 3 Triples"
                  />
                </Box>
              )}
              {game.type === 'nassau' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Front Nine Bet ($)"
                    type="number"
                    value={(game as NassauGame).front_nine_bet}
                    onChange={(e) => handleUpdateNassauGame(game as NassauGame, 'front_nine_bet', e.target.value)}
                    size="small"
                  />
                  <TextField
                    label="Back Nine Bet ($)"
                    type="number"
                    value={(game as NassauGame).back_nine_bet}
                    onChange={(e) => handleUpdateNassauGame(game as NassauGame, 'back_nine_bet', e.target.value)}
                    size="small"
                  />
                  <TextField
                    label="Match Bet ($)"
                    type="number"
                    value={(game as NassauGame).match_bet}
                    onChange={(e) => handleUpdateNassauGame(game as NassauGame, 'match_bet', e.target.value)}
                    size="small"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={(game as NassauGame).auto_press || false}
                        onChange={(e) => handleUpdateNassauGame(game as NassauGame, 'auto_press', e.target.checked)}
                      />
                    }
                    label="Auto Press"
                  />
                  {(game as NassauGame).auto_press && (
                    <TextField
                      label="Press After (holes)"
                      type="number"
                      value={(game as NassauGame).press_after || 0}
                      onChange={(e) => handleUpdateNassauGame(game as NassauGame, 'press_after', parseInt(e.target.value))}
                      size="small"
                    />
                  )}
                </Box>
              )}
              {game.type === 'skins' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Bet Amount ($)"
                    type="number"
                    value={(game as SkinsGame).bet_amount}
                    onChange={(e) => handleUpdateSkinsGame(game as SkinsGame, 'bet_amount', e.target.value)}
                    size="small"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={(game as SkinsGame).carry_over || false}
                        onChange={(e) => handleUpdateSkinsGame(game as SkinsGame, 'carry_over', e.target.checked)}
                      />
                    }
                    label="Carry Over"
                  />
                </Box>
              )}
              <Button
                size="small"
                color="error"
                onClick={() => handleRemoveGame(game)}
                sx={{ mt: 2 }}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
