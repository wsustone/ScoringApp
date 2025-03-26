import { useState, useEffect, useMemo } from 'react';
import { Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, SelectChangeEvent, Paper, Divider } from '@mui/material';
import { Player } from './PlayerForm';
import type { GolfHole, HoleSetup, GameType } from '../types/game';

interface GameProps {
  holes: GolfHole[];
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  holeSetups: { [key: number]: HoleSetup };
  onHoleSetupChange: (holeNumber: number, setup: Partial<HoleSetup>) => void;
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
}

const emptyHoleSetup: HoleSetup = {
  banker: undefined,
  dots: 0,
  doubles: {}
};

export const Game = ({
  holes,
  players,
  scores,
  holeSetups,
  onHoleSetupChange,
  onScoreChange
}: GameProps) => {
  const [currentHole, setCurrentHole] = useState(1);
  const [gameType, setGameType] = useState<GameType>('banker');

  // Calculate total doubles per player
  const playerTotalDoubles = useMemo(() => {
    const totals: { [playerId: string]: number } = {};
    players.forEach(player => {
      totals[player.id] = Object.values(holeSetups).reduce((sum, setup) => {
        return sum + (setup?.doubles[player.id] ? 1 : 0);
      }, 0);
    });
    return totals;
  }, [players, holeSetups]);

  // Calculate times as banker per player
  const playerBankerCount = useMemo(() => {
    const counts: { [playerId: string]: number } = {};
    players.forEach(player => {
      counts[player.id] = Object.values(holeSetups).reduce((sum, setup) => {
        return sum + (setup?.banker === player.id ? 1 : 0);
      }, 0);
    });
    return counts;
  }, [players, holeSetups]);

  // Calculate player totals based on banker rules
  const playerTotals = useMemo(() => {
    const totals: { [playerId: string]: number } = {};
    
    // Initialize totals to 0
    players.forEach(player => {
      totals[player.id] = 0;
    });

    // Calculate totals for each hole
    holes.forEach(hole => {
      const setup = holeSetups[hole.number];
      if (!setup?.banker || setup.dots === 0) return;

      const bankerScore = scores[setup.banker]?.[hole.number] || 0;
      if (bankerScore === null) return;

      // Compare banker's score against each other player
      players.forEach(player => {
        if (player.id === setup.banker) return; // Skip banker

        const playerScore = scores[player.id]?.[hole.number] || 0;
        if (playerScore === null) return;

        // Calculate if either player has doubles
        const bankerDouble = setup.banker && setup.doubles && setup.doubles[setup.banker] || false;
        const playerDouble = setup.doubles && setup.doubles[player.id] || false;
        const multiplier = (bankerDouble || playerDouble) ? 2 : 1;

        // Compare net scores
        if (bankerScore < playerScore) {
          // Banker wins against this player
          if (setup.banker) {
            totals[setup.banker] = (totals[setup.banker] || 0) + (setup.dots || 0) * multiplier;
          }
          totals[player.id] = (totals[player.id] || 0) - (setup.dots || 0) * multiplier;
        } else if (bankerScore > playerScore) {
          // Player wins against banker
          if (setup.banker) {
            totals[setup.banker] = (totals[setup.banker] || 0) - (setup.dots || 0) * multiplier;
          }
          totals[player.id] = (totals[player.id] || 0) + (setup.dots || 0) * multiplier;
        }
        // If scores are equal, no points are exchanged
      });
    });

    return totals;
  }, [players, holeSetups, scores, holes]);

  // Initialize scores for all players
  useEffect(() => {
    players.forEach(player => {
      if (!scores[player.id]) {
        onScoreChange(player.id, currentHole, null);
      }
    });
  }, [players, scores, currentHole, onScoreChange]);

  // Initialize hole setups
  useEffect(() => {
    if (!holeSetups[currentHole]) {
      onHoleSetupChange(currentHole, { ...emptyHoleSetup });
    }
  }, [currentHole, holeSetups, onHoleSetupChange]);

  const handleHoleChange = (event: SelectChangeEvent<number>) => {
    setCurrentHole(event.target.value as number);
  };

  const handleGameTypeChange = (event: SelectChangeEvent<GameType>) => {
    setGameType(event.target.value as GameType);
  };

  const handleBankerChange = (playerId: string | undefined) => {
    onHoleSetupChange(currentHole, { banker: playerId });
  };

  const handleDotsChange = (dots: number) => {
    onHoleSetupChange(currentHole, { dots });
  };

  const handleDoubleChange = (playerId: string) => {
    const currentDoubles = holeSetups[currentHole]?.doubles || {};
    onHoleSetupChange(currentHole, {
      doubles: {
        ...currentDoubles,
        [playerId]: !currentDoubles[playerId]
      }
    });
  };

  const currentHoleSetup = holeSetups[currentHole] || { ...emptyHoleSetup };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          {/* Game Type Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Game Type</InputLabel>
              <Select
                value={gameType}
                onChange={handleGameTypeChange}
                label="Game Type"
              >
                <MenuItem value="banker">Banker</MenuItem>
                <MenuItem value="mrpar">Mr. Par</MenuItem>
                <MenuItem value="wolf">Wolf</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Current Hole Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Current Hole</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Hole</InputLabel>
                    <Select
                      value={currentHole}
                      onChange={handleHoleChange}
                      label="Hole"
                    >
                      {holes.map(hole => (
                        <MenuItem key={hole.number} value={hole.number}>
                          Hole {hole.number}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {gameType === 'banker' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Banker</InputLabel>
                      <Select
                        value={currentHoleSetup.banker || ''}
                        onChange={(e: SelectChangeEvent<string>) => handleBankerChange(e.target.value || undefined)}
                        label="Banker"
                      >
                        <MenuItem value="">None</MenuItem>
                        {players.map(player => (
                          <MenuItem key={player.id} value={player.id}>
                            {player.name || `Player ${player.id}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {gameType === 'banker' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Dots for this hole"
                      value={currentHoleSetup.dots}
                      onChange={(e) => handleDotsChange(parseInt(e.target.value, 10) || 0)}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Doubles</Typography>
                  {players.map(player => (
                    <Button
                      key={player.id}
                      variant={currentHoleSetup.doubles && currentHoleSetup.doubles[player.id] ? 'contained' : 'outlined'}
                      onClick={() => handleDoubleChange(player.id)}
                      sx={{ m: 1 }}
                    >
                      {player.name || `Player ${player.id}`}
                    </Button>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Scores</Typography>
                  <Grid container spacing={2}>
                    {players.map(player => (
                      <Grid item xs={12} sm={6} key={player.id}>
                        <TextField
                          fullWidth
                          label={player.name || `Player ${player.id}`}
                          type="number"
                          value={scores[player.id]?.[currentHole] ?? ''}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Dots History Section */}
          {gameType === 'banker' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Dots History</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {holes.map(hole => {
                    const holeSetup = holeSetups[hole.number] || emptyHoleSetup;
                    const banker = players.find(p => p.id === holeSetup.banker);
                    
                    return (
                      <Paper
                        key={hole.number}
                        sx={{
                          p: 1,
                          minWidth: '120px',
                          textAlign: 'center',
                          bgcolor: hole.number === currentHole ? 'primary.light' : 'background.paper'
                        }}
                      >
                        <Typography variant="subtitle2">
                          Hole {hole.number}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {(holeSetup.dots || 0)} dots
                        </Typography>
                        {banker && (
                          <Typography variant="caption" display="block">
                            Banker: {banker.name || `Player ${banker.id}`}
                          </Typography>
                        )}
                      </Paper>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Game Results Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Game Results</Typography>
              <Grid container spacing={2}>
                {players.map(player => (
                  <Grid item xs={12} sm={6} md={4} key={player.id}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1">{player.name || `Player ${player.id}`}</Typography>
                      {gameType === 'banker' && (
                        <>
                          <Typography variant="body2" color="primary">
                            Total Points: {playerTotals[player.id] || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Times as Banker: {playerBankerCount[player.id] || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Doubles: {playerTotalDoubles[player.id] || 0}
                          </Typography>
                        </>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
