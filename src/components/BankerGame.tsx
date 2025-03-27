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
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Stack,
  SelectChangeEvent,
  Tooltip,
  Checkbox
} from '@mui/material';
import { Player } from './PlayerForm';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSE } from '../graphql/queries';
import { HoleSetup, GameOptions } from '../types/game';

interface BankerGameProps {
  players: Player[];
  courseId: string;
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

export const BankerGame: React.FC<BankerGameProps> = ({ 
  players, 
  courseId,
  scores,
  holes,
  currentHole,
  onCurrentHoleChange,
  onScoreChange
}) => {
  const [holeSetups, setHoleSetups] = useState<{ [key: number]: HoleSetup }>({});
  const [gameOptions, setGameOptions] = useState<GameOptions>({ doubleBirdieBets: false });

  const { loading, error, data } = useQuery(GET_GOLF_COURSE, {
    variables: { id: courseId }
  });

  // Load saved game options
  useEffect(() => {
    const savedOptions = localStorage.getItem('bankerGameOptions');
    if (savedOptions) {
      setGameOptions(JSON.parse(savedOptions));
    }
  }, []);

  // Save game options
  useEffect(() => {
    localStorage.setItem('bankerGameOptions', JSON.stringify(gameOptions));
  }, [gameOptions]);

  // Initialize hole setup if not present
  useEffect(() => {
    if (!holeSetups[currentHole]) {
      setHoleSetups(prev => ({
        ...prev,
        [currentHole]: { ...emptyHoleSetup }
      }));
    }
  }, [currentHole, holeSetups]);

  if (loading) return <Typography>Loading course data...</Typography>;
  if (error) return <Typography color="error">Error loading course: {error.message}</Typography>;

  const course = data.golfCourse;
  const currentHoleSetup = holeSetups[currentHole] || { ...emptyHoleSetup };

  const handleHoleChange = (event: SelectChangeEvent<number>) => {
    onCurrentHoleChange(Number(event.target.value));
  };

  const handleBankerChange = (bankerId: string | undefined) => {
    setHoleSetups(prev => ({
      ...prev,
      [currentHole]: { ...prev[currentHole], banker: bankerId }
    }));
  };

  const handleDotsChange = (dots: number) => {
    setHoleSetups(prev => ({
      ...prev,
      [currentHole]: { ...prev[currentHole], dots }
    }));
  };

  const handleDoubleChange = (playerId: string, isDouble: boolean) => {
    setHoleSetups(prev => ({
      ...prev,
      [currentHole]: {
        ...prev[currentHole],
        doubles: {
          ...prev[currentHole]?.doubles,
          [playerId]: isDouble
        }
      }
    }));
  };

  const handleGameOptionsChange = (options: Partial<GameOptions>) => {
    setGameOptions(prev => ({ ...prev, ...options }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {course.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {course.location}
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {players.map((player) => {
          const tee = course.tees.find((t: any) => t.id === player.teeId);
          return (
            <Grid item xs={12} sm={6} md={3} key={player.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{player.name}</Typography>
                <Typography>Handicap: {player.handicap}</Typography>
                <Typography>Tee: {tee?.name} ({tee?.gender})</Typography>
                <Typography>Course Rating: {tee?.courseRating}</Typography>
                <Typography>Slope Rating: {tee?.slopeRating}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Game Options</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="When enabled, gross birdies (1 under par) double the bet and eagles (2 under par) quadruple the bet. These multiply with other doubles." placement="right">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={gameOptions.doubleBirdieBets}
                onChange={(e) => handleGameOptionsChange({ doubleBirdieBets: e.target.checked })}
              />
              <Typography>Double Birdie / Quad Eagle</Typography>
            </Box>
          </Tooltip>
        </Box>
      </Paper>

      <Grid container spacing={2}>
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Banker</InputLabel>
                  <Select
                    value={currentHoleSetup.banker || ''}
                    onChange={(e) => handleBankerChange(e.target.value || undefined)}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Dots for this hole"
                  value={currentHoleSetup.dots}
                  onChange={(e) => handleDotsChange(parseInt(e.target.value, 10) || 0)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Doubles</Typography>
                {players.map(player => (
                  <Button
                    key={player.id}
                    variant={currentHoleSetup.doubles[player.id] ? 'contained' : 'outlined'}
                    onClick={() => handleDoubleChange(player.id, !currentHoleSetup.doubles[player.id])}
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
                        onChange={(e) => onScoreChange(player.id, currentHole, e.target.value ? parseInt(e.target.value, 10) : null)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Dots History</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Hole</TableCell>
                    <TableCell>Par</TableCell>
                    <TableCell>Banker</TableCell>
                    <TableCell>Dots</TableCell>
                    <TableCell align="center">Doubles</TableCell>
                    <TableCell>Dots History</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holes.map((hole) => {
                    const setup = holeSetups[hole.number] || { ...emptyHoleSetup };
                    return (
                      <TableRow key={hole.number}>
                        <TableCell>{hole.number}</TableCell>
                        <TableCell>{hole.par}</TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={setup.banker || ''}
                              onChange={(e) => handleBankerChange(e.target.value || undefined)}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {players.map((player) => (
                                <MenuItem key={player.id} value={player.id}>
                                  {player.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={setup.dots}
                            onChange={(e) => handleDotsChange(parseInt(e.target.value) || 1)}
                            inputProps={{ min: 1, max: 5 }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            {players.map((player) => (
                              <Box key={player.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Checkbox
                                  checked={!!setup.doubles[player.id]}
                                  onChange={(e) => handleDoubleChange(player.id, e.target.checked)}
                                  disabled={setup.banker === player.id}
                                />
                                <Typography variant="caption">{player.name}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {setup.banker ? (
                            <Stack spacing={1}>
                              <Typography variant="body2">
                                {hole.number} ({setup.dots})
                              </Typography>
                              {Object.entries(scores)
                                .filter(([_, playerScores]) => playerScores[hole.number] !== null)
                                .map(([playerId, playerScores]) => {
                                  const player = players.find(p => p.id === playerId)?.name;
                                  const playerScore = playerScores[hole.number]!;
                                  const bankerScore = setup.banker ? scores[setup.banker][hole.number]! : null;
                                  if (!bankerScore) return null;
                                  
                                  const diff = playerScore - bankerScore;
                                  let multiplier = 1;
                                  
                                  if (setup.banker && (setup.doubles[playerId] || setup.doubles[setup.banker])) {
                                    multiplier *= 2;
                                  }
                                  
                                  if (gameOptions.doubleBirdieBets) {
                                    if (playerScore === hole.par - 2) multiplier *= 4;
                                    else if (playerScore === hole.par - 1) multiplier *= 2;
                                    if (bankerScore === hole.par - 2) multiplier *= 4;
                                    else if (bankerScore === hole.par - 1) multiplier *= 2;
                                  }

                                  const points = setup.dots * multiplier;
                                  const isPositive = diff <= 0;
                                  
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
                                        sx={{ fontWeight: playerId === setup.banker ? 700 : 400 }}
                                      >
                                        {player}
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ color: isPositive ? 'success.main' : 'error.main' }}
                                      >
                                        {isPositive ? '+' : '-'}{points}
                                      </Typography>
                                    </Stack>
                                  );
                                })}
                            </Stack>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
