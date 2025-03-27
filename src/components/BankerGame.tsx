import React, { useState, useEffect } from 'react';
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
  Stack,
  SelectChangeEvent,
  Tooltip,
  Checkbox,
  IconButton,
  Collapse,
  Input
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Player } from './PlayerForm';
import { HoleSetup } from '../types/game';

interface GameOptions {
  doubleBirdieBets: boolean;
}

interface BankerGameProps {
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  holes: { number: number; par: number }[];
  currentHole: number;
  onCurrentHoleChange: (hole: number) => void;
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
}

const emptyHoleSetup: HoleSetup = {
  banker: undefined,
  dots: 0,
  doubles: {}
};

export const calculatePoints = (
  playerScore: number,
  bankerScore: number,
  holePar: number,
  baseDots: number,
  playerDoubled: boolean,
  bankerDoubled: boolean,
  doubleBirdieBets: boolean,
  isBanker: boolean
) => {
  const diff = playerScore - bankerScore;
  
  if (diff === 0) {
    return { points: 0, isPositive: true };
  }

  // Start with base dots
  let dots = baseDots;

  const tripleBet = holePar === 3;
  // Apply banker's double first if they doubled
  if (bankerDoubled) {
    if(tripleBet){
      dots *= 3;
    }else{
    dots *= 2;
    }
  }

  // Apply player's double if they doubled
  if (playerDoubled) {
    if(tripleBet){
      dots *= 3;
    }else{
      dots *= 2;
    }
  }

  // Check for birdies/eagles if enabled
  if (doubleBirdieBets) {
    let multiplier = 1;
    if (playerScore === holePar - 1 || bankerScore === holePar - 1) { // Birdie
      multiplier = 2;
    }
    if (playerScore === holePar - 2 || bankerScore === holePar - 2) { // Eagle
      multiplier = 4;
    }
    dots *= multiplier;
  }

  if (isBanker) {
    return { points: dots, isPositive: diff > 0 };
  }
  
  return { points: dots, isPositive: diff < 0 };
};


export const BankerGame: React.FC<BankerGameProps> = ({ 
  players, 
  scores,
  holes,
  currentHole,
  onCurrentHoleChange,
  onScoreChange
}) => {
  const [holeSetups, setHoleSetups] = useState<{ [key: number]: HoleSetup }>({});
  const [doubleBirdieBets, setDoubleBirdieBets] = useState(false);
  const [dotsHistory, setDotsHistory] = useState<{ [key: string]: number }>({});
  const [dotsHistoryOpen, setDotsHistoryOpen] = useState(false);

  const calculateHolePoints = (
    currentHole: number,
    scores: { [key: string]: { [key: number]: number | null } },
    holeSetup: HoleSetup,
    holePar: number
  ) => {
    const bankerPoints: { [key: string]: number } = {};
    const playerPoints: { [key: string]: number } = {};
    
    const bankerId = holeSetup.banker;
    if (!bankerId) return { bankerPoints, playerPoints };

    const bankerScore = scores[bankerId][currentHole];
    if (bankerScore === null) return { bankerPoints, playerPoints };

    // Calculate points for each player against the banker individually
    players.forEach(player => {
      if (player.id === bankerId) return; // Skip banker

      const playerScore = scores[player.id][currentHole];
      if (playerScore === null) return;

      const isPlayerDoubled = Boolean(holeSetup.doubles?.[player.id]);
      const isBankerDoubled = Boolean(holeSetup.doubles?.[bankerId]);

      // Calculate player's points vs banker
      const playerResult = calculatePoints(
        playerScore,
        bankerScore,
        holePar,
        holeSetup.dots,
        isPlayerDoubled,
        isBankerDoubled,
        doubleBirdieBets,
        false
      );

      // Store points for player
      playerPoints[player.id] = playerResult.isPositive ? playerResult.points : -playerResult.points;

      // Add corresponding points for banker (opposite of player's points)
      bankerPoints[player.id] = -playerPoints[player.id];
    });

    return { bankerPoints, playerPoints };
  };

  const updateHoleSetup = (hole: number, setup: HoleSetup) => {
    const newHoleSetups = { ...holeSetups, [hole]: setup };
    setHoleSetups(newHoleSetups);

    // Get the hole's par
    const holePar = holes.find(h => h.number === hole)?.par || 0;
    if (holePar === 0) return;

    // Calculate points for the hole
    const { bankerPoints, playerPoints } = calculateHolePoints(hole, scores, setup, holePar);

    // Update the dots history
    const newDotsHistory = { ...dotsHistory };
    if (setup.banker) {
      // Update banker's total
      const bankerTotal = Object.values(bankerPoints).reduce((sum, points) => sum + points, 0);
      newDotsHistory[setup.banker] = (newDotsHistory[setup.banker] || 0) + bankerTotal;

      // Update each player's total
      players.forEach(player => {
        if (player.id !== setup.banker && playerPoints[player.id] !== undefined) {
          newDotsHistory[player.id] = (newDotsHistory[player.id] || 0) + playerPoints[player.id];
        }
      });
    }

    setDotsHistory(newDotsHistory);
  };

  // Load saved game options
  useEffect(() => {
    const savedOptions = localStorage.getItem('bankerGameOptions');
    if (savedOptions) {
      const options = JSON.parse(savedOptions);
      setDoubleBirdieBets(options.doubleBirdieBets);
    }
  }, []);

  // Save game options
  useEffect(() => {
    localStorage.setItem('bankerGameOptions', JSON.stringify({ doubleBirdieBets }));
  }, [doubleBirdieBets]);

  // Initialize hole setup if not present
  useEffect(() => {
    if (!holeSetups[currentHole]) {
      setHoleSetups(prev => ({
        ...prev,
        [currentHole]: { ...emptyHoleSetup }
      }));
    }
  }, [currentHole, holeSetups]);

  const currentHoleSetup = holeSetups[currentHole] || { ...emptyHoleSetup };

  const handleHoleChange = (event: SelectChangeEvent<number>) => {
    onCurrentHoleChange(Number(event.target.value));
  };

  const handleBankerChange = (bankerId: string | undefined) => {
    updateHoleSetup(currentHole, { ...currentHoleSetup, banker: bankerId });
  };

  const handleDotsChange = (dots: number) => {
    updateHoleSetup(currentHole, { ...currentHoleSetup, dots });
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

  const handleGameOptionsChange = (options: Partial<GameOptions>) => {
    if (typeof options.doubleBirdieBets === 'boolean') {
      setDoubleBirdieBets(options.doubleBirdieBets);
    }
  };

  return (
    <Box>
      {/* Game Options */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Game Options</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="When enabled, gross birdies (1 under par) double the bet and eagles (2 under par) quadruple the bet. These multiply with other doubles." placement="right">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={doubleBirdieBets}
                onChange={(e) => handleGameOptionsChange({ doubleBirdieBets: e.target.checked })}
              />
              <Typography>Double Birdie / Quad Eagle</Typography>
            </Box>
          </Tooltip>
        </Box>
      </Paper>

      {/* Current Hole Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Current Hole</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="hole-select-label">Hole</InputLabel>
                      <Select
                        labelId="hole-select-label"
                        id="hole-select"
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
                  <Grid item xs={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="banker-select-label">Select Banker</InputLabel>
                      <Select
                        labelId="banker-select-label"
                        id="banker-select"
                        value={currentHoleSetup.banker || ''}
                        label="Select Banker"
                        onChange={(e) => handleBankerChange(e.target.value || undefined)}
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
                  <Grid item xs={4}>
                    <FormControl>
                      <InputLabel htmlFor="dots-input">Dots</InputLabel>
                      <Input
                        id="dots-input"
                        type="number"
                        value={currentHoleSetup.dots}
                        onChange={(e) => handleDotsChange(parseInt(e.target.value) || 0)}
                        inputProps={{ min: 0 }}
                        aria-label="dots"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      {holes.find(h => h.number === currentHole)?.par === 3 ? 'Triple Bet' : 'Double Bet'}
                    </Typography>
                    {players.map(player => (
                      <Button
                        key={player.id}
                        variant={currentHoleSetup.doubles?.[player.id] ? 'contained' : 'outlined'}
                        onClick={() => handleDoubleChange(player.id, !currentHoleSetup.doubles?.[player.id])}
                        sx={{ m: 1 }}
                      >
                        {player.name || `Player ${player.id}`}
                      </Button>
                    ))}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Scores</Typography>
                    <table role="table" aria-label="Player Scores">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map(player => (
                          <tr key={player.id}>
                            <td>{player.name}</td>
                            <td>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                inputProps={{
                                  'aria-label': `Score for ${player.name}`,
                                  role: 'spinbutton'
                                }}
                                value={scores[player.id]?.[currentHole] ?? ''}
                                onChange={(e) => onScoreChange(player.id, currentHole, e.target.value ? parseInt(e.target.value, 10) : null)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>Dots</Typography>
                {currentHoleSetup.banker ? (
                  <Stack spacing={1}>
                    {Object.entries(scores)
                      .filter(([_, playerScores]) => playerScores[currentHole] !== null)
                      .map(([playerId, playerScores]) => {
                        const player = players.find(p => p.id === playerId)?.name;
                        const playerScore = playerScores[currentHole]!;
                        const bankerScore = currentHoleSetup.banker && scores[currentHoleSetup.banker] ? scores[currentHoleSetup.banker][currentHole]! : null;
                        if (!bankerScore || !currentHoleSetup.banker) return null;
                        
                        const currentHolePar = holes.find(h => h.number === currentHole)?.par || 4;
                        const { points, isPositive } = calculatePoints(
                          playerScore,
                          bankerScore,
                          currentHolePar,
                          currentHoleSetup.dots,
                          Boolean(currentHoleSetup.doubles?.[playerId]),
                          Boolean(currentHoleSetup.doubles?.[currentHoleSetup.banker]),
                          doubleBirdieBets,
                          playerId === currentHoleSetup.banker
                        );
                        
                        return (
                          <Stack 
                            key={playerId} 
                            direction="row" 
                            spacing={1} 
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ minWidth: 100 }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: playerId === currentHoleSetup.banker ? 700 : 400
                              }}
                            >
                              {player}
                            </Typography>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                color: isPositive ? 'success.main' : 'error.main'
                              }}
                            >
                              {isPositive ? '+' : '-'}{points}
                            </Typography>
                          </Stack>
                        );
                      })}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No Banker</Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Dots History Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Dots History</Typography>
              <IconButton onClick={() => setDotsHistoryOpen(!dotsHistoryOpen)}>
                {dotsHistoryOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </Box>
            <Collapse in={dotsHistoryOpen}>
              <table role="table" aria-label="Dots History">
                <thead>
                  <tr>
                    <th>Hole</th>
                    <th>Player</th>
                    <th>Dots</th>
                  </tr>
                </thead>
                <tbody>
                  {holes.map((hole) => {
                    const setup = holeSetups[hole.number] || { ...emptyHoleSetup };
                    if (!setup.banker) return null;

                    return (
                      <tr key={hole.number}>
                        <td>Hole {hole.number}</td>
                        <td>{setup.banker}</td>
                        <td>{dotsHistory[setup.banker] || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Collapse>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
