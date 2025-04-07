import { useState } from 'react';
import { Box, Typography, TextField, Card, CardContent, Grid, IconButton, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PlayerRound } from '../types/player';
import { Hole, Game, TeeSetting } from '../types/game';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

interface Score {
  id: string;
  round_id: string;
  hole_id: string;
  player_id: string;
  gross_score: number;
  net_score: number;
  has_stroke: boolean;
  timestamp: string;
}

interface HoleByHoleProps {
  players: PlayerRound[];
  holes: Hole[];
  scores: Score[];
  onScoreUpdate: (playerId: string, holeId: string, score: number) => void;
  playerTees: { [key: string]: TeeSetting };
  games: Game[];
  onBankerUpdate?: (holeNumber: number, data: Partial<BankerHoleData>) => void;
}

interface BankerHoleData {
  hole_number: number;
  winner: string | null;
  points: number;
  dots: number;
  doubles: string[];
}

export const HoleByHole = ({ players, holes, scores, onScoreUpdate, playerTees, games, onBankerUpdate }: HoleByHoleProps) => {
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [selectedBanker, setSelectedBanker] = useState<string | null>(null);
  const [bankerDots, setBankerDots] = useState<number>(1);
  const currentHole = holes[currentHoleIndex];
  const bankerGame = games.find(g => g.type === 'banker');

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

  const handleScoreChange = (playerId: string, score: string) => {
    const numScore = parseInt(score);
    if (!isNaN(numScore) && currentHole) {
      onScoreUpdate(playerId, currentHole.id, numScore);
    }
  };

  const getPlayerScore = (playerId: string) => {
    if (!currentHole) return '';
    const score = scores.find(s => s.player_id === playerId && s.hole_id === currentHole.id);
    return score ? score.gross_score.toString() : '';
  };

  const handleBankerSelect = (playerId: string) => {
    setSelectedBanker(playerId);
  };

  const handleDotsChange = (dots: number) => {
    setBankerDots(dots);
  };

  const handleBankerSubmit = () => {
    if (selectedBanker && currentHole && onBankerUpdate) {
      onBankerUpdate(currentHole.number, {
        hole_number: currentHole.number,
        winner: selectedBanker,
        points: bankerDots,
        dots: bankerDots,
        doubles: []
      });
      resetBankerState();
    }
  };

  if (!currentHole) {
    return <Typography>No holes available</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handlePreviousHole} disabled={currentHoleIndex === 0}>
          <NavigateBeforeIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mx: 2 }}>
          Hole {currentHole.number} - Par {currentHole.par}
        </Typography>
        <IconButton onClick={handleNextHole} disabled={currentHoleIndex === holes.length - 1}>
          <NavigateNextIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {players.map(player => (
          <Grid item xs={12} sm={6} md={4} key={player.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {player.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Tee: {playerTees[player.tee_id]?.name || 'Not set'}
                </Typography>
                <TextField
                  label="Score"
                  type="number"
                  value={getPlayerScore(player.id)}
                  onChange={(e) => handleScoreChange(player.id, e.target.value)}
                  fullWidth
                  margin="normal"
                />
                {bankerGame?.enabled && !selectedBanker && (
                  <Button
                    variant="outlined"
                    onClick={() => handleBankerSelect(player.id)}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Select as Banker Winner
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedBanker && bankerGame?.enabled && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Banker Settings
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Dots</InputLabel>
              <Select
                value={bankerDots}
                onChange={(e) => handleDotsChange(e.target.value as number)}
                label="Dots"
              >
                {[1, 2, 3].map(dots => (
                  <MenuItem key={dots} value={dots}>
                    {dots} {dots === 1 ? 'Dot' : 'Dots'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleBankerSubmit}
                fullWidth
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                onClick={resetBankerState}
                fullWidth
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
