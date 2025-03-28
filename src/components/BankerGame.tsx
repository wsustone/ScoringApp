import React, { useEffect, useState } from 'react';
import { useMutation, ApolloError } from '@apollo/client';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar,
  ToggleButton
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Player } from '../types/player';
import { GameOptions, HoleSetup, defaultGameOptions } from '../types/game';
import { START_ROUND, UPDATE_ROUND } from '../graphql/mutations';
import { calculatePoints } from '../utils/scoring';

interface BankerGameProps {
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  holes: { id: string; number: number; par: number }[];
  currentHole: number;
  onCurrentHoleChange: (hole: number) => void;
  courseName: string;
}

export const BankerGame: React.FC<BankerGameProps> = ({ 
  players, 
  scores,
  holes,
  currentHole,
  onCurrentHoleChange,
  courseName
}: BankerGameProps) => {
  const [gameOptions, setGameOptions] = useState<GameOptions>(defaultGameOptions);
  const [holeSetups, setHoleSetups] = useState<{ [key: number]: HoleSetup }>({});
  const [showGameOptions, setShowGameOptions] = useState(false);
  const [roundStarted, setRoundStarted] = useState(false);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: ApolloError) => {
    const message = error.graphQLErrors.length > 0
      ? error.graphQLErrors[0].message
      : error.networkError
        ? 'Network error occurred. Please check your connection.'
        : 'An unexpected error occurred';
    setError(message);
  };

  const [startRound] = useMutation(START_ROUND, {
    onError: handleError
  });

  const [updateRound] = useMutation(UPDATE_ROUND, {
    onError: handleError
  });

  const handleStartRound = async () => {
    try {
      const { data } = await startRound({
        variables: {
          courseName,
          players: players.map(p => ({
            id: p.id,
            name: p.name,
            handicap: p.handicap || 0,
            teeId: p.teeId
          })),
          holes: holes.map(h => ({
            number: h.number,
            par: h.par
          })),
          gameOptions: {
            minDots: gameOptions.minDots,
            maxDots: gameOptions.maxDots,
            dotValue: gameOptions.dotValue,
            doubleBirdieBets: gameOptions.doubleBirdieBets,
            useGrossBirdies: gameOptions.useGrossBirdies,
            par3Triples: gameOptions.par3Triples
          }
        }
      });

      if (data?.startRound) {
        setRoundId(data.startRound);
        setRoundStarted(true);
      }
    } catch (error) {
      // Error will be handled by onError callback
    }
  };

  useEffect(() => {
    if (roundStarted && roundId) {
      updateRound({
        variables: {
          input: {
            id: roundId,
            scores: Object.entries(scores).flatMap(([playerId, holeScores]) =>
              Object.entries(holeScores).map(([holeNumber, score]) => ({
                playerId,
                holeId: holes.find(h => h.number === Number(holeNumber))?.id,
                score: score || null
              }))
            ).filter(s => s.score !== null),
            bankerSetups: Object.entries(holeSetups).map(([holeNumber, setup]) => ({
              holeId: holes.find(h => h.number === Number(holeNumber))?.id,
              bankerId: setup.bankerId,
              dots: setup.dots
            })),
            bankerDoubles: Object.entries(holeSetups).flatMap(([holeNumber, setup]) =>
              Object.entries(setup.doubles)
                .filter(([_, isDoubled]) => isDoubled)
                .map(([playerId]) => ({
                  holeId: holes.find(h => h.number === Number(holeNumber))?.id,
                  playerId,
                  isDoubled: true
                }))
            ),
            gameOptions
          }
        }
      });
    }
  }, [scores, holeSetups, gameOptions, roundStarted, roundId]);

  const handleHoleSetupChange = (holeNumber: number, bankerId: string | null, dots: number) => {
    setHoleSetups(prev => ({
      ...prev,
      [holeNumber]: {
        bankerId,
        dots,
        doubles: {}
      }
    }));
  };

  const currentHoleSetup = holeSetups[currentHole] || {
    bankerId: null,
    dots: gameOptions.minDots,
    doubles: {}
  };

  const calculateHolePoints = (playerId: string) => {
    const playerScore = scores[playerId]?.[currentHole];
    const bankerScore = scores[currentHoleSetup.bankerId || '']?.[currentHole];
    const hole = holes.find(h => h.number === currentHole);

    if (!playerScore || !bankerScore || !hole) return 0;

    return calculatePoints(
      playerScore,
      bankerScore,
      hole.par,
      currentHoleSetup.dots,
      currentHoleSetup.doubles[playerId] || false,
      currentHoleSetup.doubles[currentHoleSetup.bankerId || ''] || false,
      gameOptions.doubleBirdieBets,
      gameOptions.useGrossBirdies,
      hole.par === 3,
      gameOptions.par3Triples
    );
  };

  const handleBankerChange = (bankerId: string | null) => {
    handleHoleSetupChange(currentHole, bankerId, currentHoleSetup.dots);
  };

  const handleDotsChange = (dots: number) => {
    handleHoleSetupChange(currentHole, currentHoleSetup.bankerId, dots);
  };

  const handleDoubleChange = (playerId: string, isDoubled: boolean) => {
    setHoleSetups(prev => ({
      ...prev,
      [currentHole]: {
        ...currentHoleSetup,
        doubles: {
          ...currentHoleSetup.doubles,
          [playerId]: isDoubled
        }
      }
    }));
  };

  const handleHoleChange = (holeNumber: number) => {
    onCurrentHoleChange(holeNumber);
  };

  const renderStartRoundButton = () => {
    if (roundStarted) return null;
    return (
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartRound}
          disabled={players.length < 3}
        >
          Start Round
        </Button>
      </Box>
    );
  };

  return (
    <Box>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Game Options */}
      <Box mb={2}>
        <Button
          variant="contained"
          onClick={() => setShowGameOptions(!showGameOptions)}
          endIcon={showGameOptions ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        >
          Game Options
        </Button>
        <Collapse in={showGameOptions}>
          <Paper sx={{ p: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Dots"
                  value={gameOptions.minDots}
                  onChange={(e) => setGameOptions(prev => ({ ...prev, minDots: parseInt(e.target.value) || 1 }))}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Dots"
                  value={gameOptions.maxDots}
                  onChange={(e) => setGameOptions(prev => ({ ...prev, maxDots: parseInt(e.target.value) || 1 }))}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Dot Value"
                  value={gameOptions.dotValue}
                  onChange={(e) => setGameOptions(prev => ({ ...prev, dotValue: parseFloat(e.target.value) || 0.25 }))}
                  InputProps={{ inputProps: { min: 0.01, step: 0.25 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={gameOptions.doubleBirdieBets}
                      onChange={(e) => setGameOptions(prev => ({ ...prev, doubleBirdieBets: e.target.checked }))}
                    />
                  }
                  label="Double Birdie Bets"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={gameOptions.useGrossBirdies}
                      onChange={(e) => setGameOptions(prev => ({ ...prev, useGrossBirdies: e.target.checked }))}
                    />
                  }
                  label="Use Gross Birdies"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={gameOptions.par3Triples}
                      onChange={(e) => setGameOptions(prev => ({ ...prev, par3Triples: e.target.checked }))}
                    />
                  }
                  label="Par 3 Triples"
                />
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Box>

      {/* Hole Navigation */}
      <Box mb={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => handleHoleChange(currentHole - 1)}
              disabled={currentHole <= 1}
            >
              Previous
            </Button>
          </Grid>
          <Grid item>
            <Typography variant="h6">
              Hole {currentHole}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => handleHoleChange(currentHole + 1)}
              disabled={currentHole >= holes.length}
            >
              Next
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Banker Setup */}
      <Box mb={2}>
        <Paper sx={{ p: 2 }} role="region" aria-label="Banker Setup">
          <Typography variant="h6" gutterBottom>
            Banker Setup
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Banker</InputLabel>
                <Select
                  value={currentHoleSetup.bankerId || ''}
                  onChange={(e) => handleBankerChange(e.target.value)}
                  label="Banker"
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Dots"
                  type="number"
                  value={currentHoleSetup.dots}
                  onChange={(e) => handleDotsChange(parseInt(e.target.value) || gameOptions.minDots)}
                  inputProps={{
                    min: gameOptions.minDots,
                    max: gameOptions.maxDots
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
          
          {/* Doubles Section */}
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              Double Bets
            </Typography>
            <Grid container spacing={2}>
              {players.map((player) => (
                <Grid item xs={12} sm={6} md={4} key={player.id}>
                  <ToggleButton
                    value={player.id}
                    selected={currentHoleSetup.doubles[player.id] || false}
                    onChange={() => handleDoubleChange(
                      player.id,
                      !currentHoleSetup.doubles[player.id]
                    )}
                    fullWidth
                    color="primary"
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                    }}
                  >
                    {player.name}
                  </ToggleButton>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Box>

      {/* Score Card */}
      <Box>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Scores
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="right">Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      {player.name}
                      {currentHoleSetup.doubles[player.id] && (
                        <Typography component="span" color="primary" sx={{ ml: 1 }}>
                          (Double)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {scores[player.id]?.[currentHole] || '-'}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{
                        color: (theme) => {
                          const points = calculateHolePoints(player.id);
                          if (points > 0) return theme.palette.success.main;
                          if (points < 0) return theme.palette.error.main;
                          return theme.palette.text.primary;
                        },
                        fontWeight: 'bold'
                      }}
                    >
                      {(() => {
                        const points = calculateHolePoints(player.id);
                        return points === 0 ? '-' : points > 0 ? `+${points}` : points;
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Start Round Button */}
      {renderStartRoundButton()}
    </Box>
  );
};
