import { Box, Typography, TextField, Card, CardContent, Grid, IconButton, Button, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { Player } from './PlayerForm';
import { Hole, BankerGame, NassauGame, SkinsGame, BankerHoleData } from '../types/game';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { useState } from 'react';

interface HoleByHoleProps {
  players: Player[];
  holes: Hole[];
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
  games: (BankerGame | NassauGame | SkinsGame)[];
  onBankerUpdate?: (holeNumber: number, data: Partial<BankerHoleData>) => void;
}

export const HoleByHole = ({ players, holes, scores, onScoreChange, games, onBankerUpdate }: HoleByHoleProps) => {
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [selectedBanker, setSelectedBanker] = useState<string | null>(null);
  const [bankerDots, setBankerDots] = useState<number>(1);
  const currentHole = holes[currentHoleIndex];
  const bankerGame = games.find(g => g.type === 'banker') as BankerGame | undefined;

  const getBankerData = (holeNumber: number): BankerHoleData | null => {
    if (!bankerGame) return null;
    return bankerGame.bankerData.holes.find(h => h.holeNumber === holeNumber) || {
      holeNumber,
      winner: null,
      points: 0,
      dots: 0,
      doubles: []
    };
  };

  const handlePreviousHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
      resetBankerState();
    }
  };

  const handleNextHole = () => {
    if (currentHoleIndex < holes.length - 1) {
      setCurrentHoleIndex(currentHoleIndex + 1);
      resetBankerState();
    }
  };

  const resetBankerState = () => {
    setSelectedBanker(null);
    setBankerDots(1);
  };

  const handleBankerSelect = (playerId: string | null) => {
    setSelectedBanker(playerId);
    if (onBankerUpdate && playerId) {
      const currentData = getBankerData(currentHole.number);
      onBankerUpdate(currentHole.number, {
        winner: playerId,
        dots: bankerDots,
        points: bankerDots * (bankerGame?.dotValue || 1),
        doubles: currentData?.doubles || []
      });
    }
  };

  const handleDotsChange = (dots: number) => {
    setBankerDots(dots);
    if (onBankerUpdate && selectedBanker) {
      const currentData = getBankerData(currentHole.number);
      onBankerUpdate(currentHole.number, {
        winner: selectedBanker,
        dots,
        points: dots * (bankerGame?.dotValue || 1),
        doubles: currentData?.doubles || []
      });
    }
  };

  const handleDoubleToggle = (playerId: string) => {
    if (!onBankerUpdate) return;

    const currentData = getBankerData(currentHole.number);
    const doubles = currentData?.doubles || [];
    const updatedDoubles = doubles.includes(playerId)
      ? doubles.filter(id => id !== playerId)
      : [...doubles, playerId];

    onBankerUpdate(currentHole.number, {
      ...currentData,
      doubles: updatedDoubles
    });
  };

  if (!currentHole) return null;

  const bankerData = getBankerData(currentHole.number);
  const maxDots = bankerGame?.maxDots || 4;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton 
          onClick={handlePreviousHole} 
          disabled={currentHoleIndex === 0}
          size="large"
        >
          <NavigateBeforeIcon />
        </IconButton>
        <Typography variant="h5">
          Hole {currentHole.number} (Par {currentHole.par})
        </Typography>
        <IconButton 
          onClick={handleNextHole} 
          disabled={currentHoleIndex === holes.length - 1}
          size="large"
        >
          <NavigateNextIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {players.map(player => {
          const score = scores[player.id]?.[currentHole.number] ?? null;
          const isOverPar = score !== null && score > currentHole.par;
          const isUnderPar = score !== null && score < currentHole.par;
          const isBanker = bankerData?.winner === player.id;
          const hasDoubled = bankerData?.doubles?.includes(player.id) || false;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={player.id}>
              <Card sx={{ 
                borderColor: isBanker ? 'primary.main' : 'transparent',
                borderWidth: 2,
                borderStyle: 'solid'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {player.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      label="Score"
                      type="number"
                      value={score === null ? '' : score}
                      onChange={(e) => {
                        const value = e.target.value;
                        onScoreChange(
                          player.id,
                          currentHole.number,
                          value === '' ? null : parseInt(value, 10)
                        );
                      }}
                      sx={{ width: '100px' }}
                      InputProps={{
                        sx: {
                          color: isOverPar ? 'error.main' : isUnderPar ? 'success.main' : 'inherit'
                        }
                      }}
                    />
                    {score !== null && (
                      <Typography
                        sx={{
                          color: isOverPar ? 'error.main' : isUnderPar ? 'success.main' : 'inherit'
                        }}
                      >
                        {score > currentHole.par ? `+${score - currentHole.par}` : 
                         score < currentHole.par ? `${score - currentHole.par}` : 'E'}
                      </Typography>
                    )}
                  </Box>
                  {bankerGame && (
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant={isBanker ? "contained" : "outlined"}
                        onClick={() => handleBankerSelect(isBanker ? null : player.id)}
                        fullWidth
                        color={isBanker ? "primary" : "inherit"}
                      >
                        {isBanker ? "Remove Banker" : "Set as Banker"}
                      </Button>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hasDoubled}
                            onChange={() => handleDoubleToggle(player.id)}
                            color="warning"
                          />
                        }
                        label="Double"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {bankerGame && selectedBanker && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Banker Options
            </Typography>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Dots</InputLabel>
              <Select
                value={bankerDots}
                label="Dots"
                onChange={(e) => handleDotsChange(e.target.value as number)}
              >
                {Array.from({ length: maxDots }, (_, i) => i + 1).map(dots => (
                  <MenuItem key={dots} value={dots}>
                    {dots} {dots === 1 ? 'Dot' : 'Dots'} ({dots * bankerGame.dotValue} points)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {bankerData?.winner && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Banker Status
            </Typography>
            <Typography>
              Winner: {players.find(p => p.id === bankerData.winner)?.name || 'Unknown'}
            </Typography>
            <Typography>
              Dots: {bankerData.dots}
            </Typography>
            <Typography>
              Points: {bankerData.points}
            </Typography>
            {bankerData.doubles.length > 0 && (
              <Typography>
                Doubles: {bankerData.doubles.map(id => players.find(p => p.id === id)?.name).join(', ')}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
