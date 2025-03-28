import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  FormControl,
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button,
  SelectChangeEvent,
  Checkbox,
  Collapse,
  FormControlLabel,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Player } from './PlayerForm';
import { HoleSetup, GameOptions, defaultGameOptions } from '../types/game';

interface BankerGameProps {
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  holes: { number: number; par: number }[];
  currentHole: number;
  onCurrentHoleChange: (hole: number) => void;
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
}

export const calculatePoints = (
  playerScore: number,
  bankerScore: number,
  holePar: number,
  dots: number,
  isPlayerDoubled: boolean,
  isBankerDoubled: boolean,
  useGrossBirdies: boolean,
  isPar3: boolean
): number => {
  if (playerScore === bankerScore) return 0; // Ties result in no points

  let multiplier = 1;
  
  // Handle Par 3 triple bets
  if (isPar3) {
    if (isPlayerDoubled) multiplier *= 3;
    if (isBankerDoubled) multiplier *= 3;
  } else {
    if (isPlayerDoubled) multiplier *= 2;
    if (isBankerDoubled) multiplier *= 2;
  }

  // Handle gross birdies/eagles if enabled
  if (useGrossBirdies) {
    // Find the highest multiplier from all cases
    const birdieEagleMultiplier = Math.max(
      // Banker cases
      bankerScore === holePar - 1 ? 2 : 1,  // Birdie
      bankerScore <= holePar - 2 ? 4 : 1,   // Eagle or better
      // Player cases
      playerScore === holePar - 1 ? 2 : 1,  // Birdie
      playerScore <= holePar - 2 ? 4 : 1    // Eagle or better
    );
    multiplier *= birdieEagleMultiplier;
  }

  const points = dots * multiplier;
  // Points are positive if player wins, negative if banker wins
  return playerScore < bankerScore ? points : -points;
};

export const BankerGame: React.FC<BankerGameProps> = ({ 
  players, 
  scores,
  holes,
  currentHole,
  onCurrentHoleChange,
  onScoreChange
}: BankerGameProps) => {
  const [gameOptions, setGameOptions] = useState<GameOptions>(defaultGameOptions);
  const [holeSetups, setHoleSetups] = useState<{ [key: number]: HoleSetup }>({});
  const [dotsHistory, setDotsHistory] = useState<{ [key: string]: number }>({});
  const [dotsHistoryOpen, setDotsHistoryOpen] = useState(false);
  const [showGameOptions, setShowGameOptions] = useState(false);

  // Validation for minimum players
  if (players.length < 3) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error" variant="h6" gutterBottom>
          Banker Game requires at least 3 players
        </Typography>
        <Typography variant="body1">
          Please add more players before starting the game.
        </Typography>
      </Paper>
    );
  }

  const calculateHolePoints = (playerId: string): number => {
    const bankerId = currentHoleSetup.banker;
    if (!bankerId) return 0;

    const bankerScore = scores[bankerId][currentHole];
    if (bankerScore === null) return 0;

    const playerScore = scores[playerId][currentHole];
    if (playerScore === null) return 0;

    const holePar = holes.find(h => h.number === currentHole)?.par || 0;
    const points = calculatePoints(
      playerScore,
      bankerScore,
      holePar,
      currentHoleSetup.dots || 0,
      Boolean(currentHoleSetup.doubles?.[playerId]),
      Boolean(currentHoleSetup.doubles?.[bankerId]),
      gameOptions.doubleBirdieBets,
      holePar === 3
    );

    // For banker, invert the points since they win when others lose
    return playerId === bankerId ? -points : points;
  };

  // Create empty hole setup with minDots
  const emptyHoleSetup = useMemo(() => ({
    banker: undefined,
    dots: gameOptions.minDots,
    doubles: {}
  }), [gameOptions.minDots]);

  const currentHoleSetup = useMemo(() => {
    return holeSetups[currentHole] || { ...emptyHoleSetup };
  }, [holeSetups, currentHole, emptyHoleSetup]);

  const updateHoleSetup = (hole: number, setup: HoleSetup) => {
    // Ensure dots is within min/max range
    setup.dots = Math.max(gameOptions.minDots, Math.min(gameOptions.maxDots, setup.dots || gameOptions.minDots));
    
    const newHoleSetups = { ...holeSetups, [hole]: setup };
    setHoleSetups(newHoleSetups);

    // Get the hole's par
    const holePar = holes.find(h => h.number === hole)?.par || 0;
    if (holePar === 0) return;

    // Calculate points for the hole
    const bankerId = setup.banker;
    if (!bankerId) return;

    // Update the dots history
    const newDotsHistory = { ...dotsHistory };
    players.forEach(player => {
      if (player.id !== bankerId && scores[player.id][hole] !== null) {
        newDotsHistory[player.id] = (newDotsHistory[player.id] || 0) + calculateHolePoints(player.id);
      }
    });
    newDotsHistory[bankerId] = (newDotsHistory[bankerId] || 0) + calculateHolePoints(bankerId);
    setDotsHistory(newDotsHistory);
  };

  const handleGameOptionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setGameOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleDotsChange = (dots: number) => {
    if (dots < gameOptions.minDots) dots = gameOptions.minDots;
    if (dots > gameOptions.maxDots) dots = gameOptions.maxDots;

    updateHoleSetup(currentHole, { ...currentHoleSetup, dots });
  };

  const handleBankerChange = (bankerId: string | undefined) => {
    updateHoleSetup(currentHole, { ...currentHoleSetup, banker: bankerId });
  };

  const handleDoubleChange = (playerId: string, isDouble: boolean) => {
    updateHoleSetup(currentHole, {
      ...currentHoleSetup,
      doubles: {
        ...currentHoleSetup.doubles,
        [playerId]: isDouble
      }
    });
  };

  // Load saved game state
  useEffect(() => {
    const savedOptions = localStorage.getItem('bankerGameOptions');
    if (savedOptions) {
      const options = JSON.parse(savedOptions);
      setGameOptions(options);
    }

    const savedHoleSetups = localStorage.getItem('bankerGameHoleSetups');
    if (savedHoleSetups) {
      setHoleSetups(JSON.parse(savedHoleSetups));
    }

    const savedDotsHistory = localStorage.getItem('bankerGameDotsHistory');
    if (savedDotsHistory) {
      setDotsHistory(JSON.parse(savedDotsHistory));
    }
  }, []);

  // Save game state
  useEffect(() => {
    localStorage.setItem('bankerGameOptions', JSON.stringify(gameOptions));
  }, [gameOptions]);

  useEffect(() => {
    localStorage.setItem('bankerGameHoleSetups', JSON.stringify(holeSetups));
  }, [holeSetups]);

  useEffect(() => {
    localStorage.setItem('bankerGameDotsHistory', JSON.stringify(dotsHistory));
  }, [dotsHistory]);

  // Initialize hole setup if not present
  useEffect(() => {
    if (!holeSetups[currentHole]) {
      setHoleSetups(prev => ({
        ...prev,
        [currentHole]: { ...emptyHoleSetup }
      }));
    }
  }, [currentHole, holeSetups]);

  // Update hole setups when gameOptions.minDots changes
  useEffect(() => {
    setHoleSetups(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(hole => {
        const holeNum = parseInt(hole);
        if (!updated[holeNum].dots || updated[holeNum].dots < gameOptions.minDots) {
          updated[holeNum] = {
            ...updated[holeNum],
            dots: gameOptions.minDots
          };
        }
      });
      return updated;
    });
  }, [gameOptions.minDots]);

  const handleHoleChange = (event: SelectChangeEvent<number>) => {
    const newHole = Number(event.target.value);
    onCurrentHoleChange(newHole);
  };

  return (
    <Box>
      {/* Game Options */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            width: '100%'
          }}
        >
          <Typography variant="h6" sx={{ mr: 2 }}>Game Options</Typography>
          <Button
            onClick={() => setShowGameOptions(!showGameOptions)}
            endIcon={showGameOptions ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            sx={{ 
              minWidth: { xs: 'auto', sm: 120 },
              whiteSpace: 'nowrap'
            }}
            size="small"
          >
            {showGameOptions ? 'Hide' : 'Show'}
          </Button>
        </Box>
        <Collapse in={showGameOptions}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={gameOptions.doubleBirdieBets}
                    onChange={handleGameOptionsChange}
                    name="doubleBirdieBets"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    Double Birdie Bets
                  </Typography>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Dots"
                    name="minDots"
                    value={gameOptions.minDots}
                    onChange={handleGameOptionsChange}
                    inputProps={{ min: 1 }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Dots"
                    name="maxDots"
                    value={gameOptions.maxDots}
                    onChange={handleGameOptionsChange}
                    inputProps={{ min: gameOptions.minDots }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Dot Value ($)"
                    name="dotValue"
                    value={gameOptions.dotValue}
                    onChange={handleGameOptionsChange}
                    inputProps={{ min: 0.01, step: 0.01 }}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Current Hole Section */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h6" gutterBottom>Current Hole</Typography>
            <Grid container spacing={2}>
              {/* Hole Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hole</InputLabel>
                  <Select
                    value={currentHole}
                    onChange={handleHoleChange}
                    label="Hole"
                  >
                    {holes.map((hole) => (
                      <MenuItem key={hole.number} value={hole.number}>
                        Hole {hole.number} (Par {hole.par})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Banker Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" data-testid="banker-select">
                  <InputLabel>Banker</InputLabel>
                  <Select
                    value={currentHoleSetup.banker || ''}
                    onChange={(e) => handleBankerChange(e.target.value || undefined)}
                    label="Banker"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {players.map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name || `Player ${player.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Dots Input */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl fullWidth size="small" data-testid="dots-input">
                    <TextField
                      fullWidth
                      type="number"
                      label="Dots"
                      value={currentHoleSetup.dots || ''}
                      onChange={(e) => handleDotsChange(Number(e.target.value))}
                      inputProps={{
                        min: gameOptions.minDots,
                        max: gameOptions.maxDots,
                        'aria-label': 'Dots'
                      }}
                      size="small"
                    />
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">
                    (Min: {gameOptions.minDots}, Max: {gameOptions.maxDots})
                  </Typography>
                </Box>
              </Grid>

              {/* Player Scores */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1,
                  '& .MuiButton-root': {
                    minWidth: { xs: 'calc(50% - 8px)', sm: 'auto' }
                  }
                }}>
                  {players.map((player) => (
                    <Button
                      key={player.id}
                      variant={currentHoleSetup.doubles?.[player.id] ? 'contained' : 'outlined'}
                      onClick={() => handleDoubleChange(player.id, !currentHoleSetup.doubles?.[player.id])}
                      size="small"
                    >
                      {player.name || `Player ${player.id}`}
                    </Button>
                  ))}
                </Box>
              </Grid>

              {/* Score Grid */}
              <Grid item xs={12}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Player</TableCell>
                        <TableCell align="right">Score</TableCell>
                        <TableCell align="right">Points</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {players.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" noWrap>
                              {player.name || `Player ${player.id}`}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              value={scores[player.id][currentHole] === null ? '' : scores[player.id][currentHole]}
                              onChange={(e) => onScoreChange(player.id, currentHole, e.target.value === '' ? null : parseInt(e.target.value))}
                              size="small"
                              inputProps={{
                                style: { textAlign: 'right', width: '60px' }
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: calculateHolePoints(player.id) >= 0 ? 'success.main' : 'error.main',
                                fontWeight: 500
                              }}
                            >
                              {calculateHolePoints(player.id)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Dots History Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography variant="h6">Dots History</Typography>
              <Button
                onClick={() => setDotsHistoryOpen(!dotsHistoryOpen)}
                endIcon={dotsHistoryOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                sx={{ minWidth: 120 }}
              >
                {dotsHistoryOpen ? 'Hide' : 'Show'}
              </Button>
            </Box>
            <Collapse in={dotsHistoryOpen}>
              {currentHoleSetup.banker ? (
                <Stack spacing={1}>
                  {Object.entries(scores)
                    .sort(([aId], [bId]) => {
                      if (aId === currentHoleSetup.banker) return 1;
                      if (bId === currentHoleSetup.banker) return -1;
                      return 0;
                    })
                    .filter(([playerId]) => {
                      const hasScore = scores[playerId][currentHole] !== null;
                      return hasScore && (playerId === currentHoleSetup.banker || currentHoleSetup.banker);
                    })
                    .map(([playerId]) => {
                      const player = players.find(p => p.id === playerId)?.name;
                      const points = calculateHolePoints(playerId);
                      
                      return (
                        <Stack 
                          key={playerId} 
                          direction="row" 
                          spacing={1} 
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ 
                            p: 1, 
                            bgcolor: 'background.default',
                            borderRadius: 1
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: playerId === currentHoleSetup.banker ? 700 : 400
                            }}
                          >
                            {player}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                color: points >= 0 ? 'success.main' : 'error.main',
                                minWidth: 40,
                                textAlign: 'right'
                              }}
                            >
                              {points >= 0 ? '+' : ''}{points}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                            >
                              dots
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    })}
                </Stack>
              ) : (
                <Typography color="text.secondary">No Banker Selected</Typography>
              )}
            </Collapse>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
