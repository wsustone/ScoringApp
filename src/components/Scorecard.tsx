import React, { useMemo } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, TextField, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { PlayerRound } from '../types/player';
import { Hole, ExtendedGolfTee } from '../types/game';

interface ScorecardProps {
  players: PlayerRound[];
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
  playerTees: { [key: string]: ExtendedGolfTee };
  onEndRound?: () => void;
  onDiscardRound?: () => void;
}

const calculateHandicapStrokes = (handicap: number, holes: Hole[]): { [key: number]: number } => {
  const strokes: { [key: number]: number } = {};
  
  // Sort holes by stroke index
  const sortedHoles = [...holes].sort((a, b) => a.stroke_index - b.stroke_index);
  
  // Calculate strokes for each hole
  sortedHoles.forEach((hole, index) => {
    const strokesForHole = Math.floor(handicap / 18); // Base strokes
    const extraStroke = index < (handicap % 18) ? 1 : 0; // Extra stroke for harder holes
    strokes[hole.number] = strokesForHole + extraStroke;
  });
  
  return strokes;
};

const calculateNetScore = (grossScore: number | null, handicapStrokes: number): number | null => {
  if (grossScore === null) return null;
  return grossScore - handicapStrokes;
};

const getScoreColor = (score: number | null, par: number): string => {
  if (score === null) return 'inherit';
  if (score < par) return '#dc3545'; // red for under par
  if (score === par) return '#0d6efd'; // blue for par
  return 'inherit'; // black for over par
};

interface EditScoreCellProps {
  currentScore: number | null;
  onSave: (score: number | null) => void;
}

const EditScoreCell = ({ currentScore, onSave }: EditScoreCellProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [score, setScore] = React.useState<string>(currentScore?.toString() || '');

  const handleSave = () => {
    const newScore = score === '' ? null : parseInt(score, 10);
    if (newScore === null || (!isNaN(newScore) && newScore >= 1)) {
      onSave(newScore);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setScore(currentScore?.toString() || '');
    }
  };

  return isEditing ? (
    <TextField
      autoFocus
      size="small"
      value={score}
      onChange={(e) => setScore(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyPress}
      inputProps={{
        style: { padding: '2px', textAlign: 'center', width: '30px' },
        min: 1,
        type: 'number'
      }}
    />
  ) : (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span>{currentScore || '-'}</span>
      <IconButton
        size="small"
        onClick={() => setIsEditing(true)}
        sx={{ ml: 0.5, opacity: 0.3, '&:hover': { opacity: 1 } }}
      >
        <EditIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
};

const calculateTotals = (playerId: string, holes: Hole[], scores: { [key: string]: { [key: number]: number | null } }, handicapStrokes: { [key: number]: number }): { grossTotal: number, netTotal: number } => {
  const playerScores = scores[playerId] || {};
  const grossTotal = holes.reduce((sum, hole) => {
    const score = playerScores[hole.number];
    return sum + (score || 0);
  }, 0);

  const netTotal = holes.reduce((sum, hole) => {
    const score = playerScores[hole.number];
    if (score === null) return sum;
    return sum + (score - (handicapStrokes[hole.number] || 0));
  }, 0);

  return { grossTotal, netTotal };
};

export const Scorecard = ({ players, scores, onScoreChange, playerTees, onEndRound, onDiscardRound }: ScorecardProps) => {
  // Group holes by player since each player might have different tees
  const playerHoles = useMemo(() => {
    return players.reduce((acc, player) => {
      const holes = player.holes || [];
      acc[player.id] = {
        frontNine: holes.filter((h: Hole) => h.number <= 9),
        backNine: holes.filter((h: Hole) => h.number > 9)
      };
      return acc;
    }, {} as { [key: string]: { frontNine: Hole[], backNine: Hole[] } });
  }, [players]);

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              {players[0]?.holes?.filter((h: Hole) => h.number <= 9).map((hole: Hole) => (
                <TableCell key={hole.id} align="center">
                  {hole.number}
                  <br />
                  Par {hole.par}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    SI {hole.stroke_index}
                  </Typography>
                </TableCell>
              ))}
              <TableCell align="center">IN</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map(player => {
              const handicapStrokes = calculateHandicapStrokes(player.handicap, player.holes || []);
              const { frontNine } = playerHoles[player.id];
              const { grossTotal: frontGrossTotal, netTotal: frontNetTotal } = calculateTotals(player.id, frontNine, scores, handicapStrokes);
              
              return (
                <TableRow key={player.id}>
                  <TableCell>
                    {player.name}
                    <br />
                    <Typography variant="caption">
                      HCP: {player.handicap}
                      <br />
                      {playerTees[player.id]?.name}
                    </Typography>
                  </TableCell>
                  {frontNine.map(hole => {
                    const grossScore = scores[player.id]?.[hole.number] || null;
                    const netScore = calculateNetScore(grossScore, handicapStrokes[hole.number] || 0);
                    
                    return (
                      <TableCell key={hole.id} align="center" sx={{ position: 'relative' }}>
                        <Box sx={{ color: getScoreColor(grossScore, hole.par) }}>
                          <EditScoreCell
                            currentScore={grossScore}
                            onSave={(score) => onScoreChange(player.id, hole.number, score)}
                          />
                        </Box>
                        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {netScore !== null ? netScore : '-'}
                        </Box>
                        {handicapStrokes[hole.number] > 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              fontSize: '0.6rem',
                            }}
                          >
                            {'*'.repeat(handicapStrokes[hole.number])}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    {frontGrossTotal}
                    <br />
                    <Typography variant="caption">
                      {frontNetTotal}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {Object.values(playerHoles).some(player => player.backNine.length > 0) && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                {players[0]?.holes?.filter((h: Hole) => h.number > 9).map((hole: Hole) => (
                  <TableCell key={hole.id} align="center">
                    {hole.number}
                    <br />
                    Par {hole.par}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      SI {hole.stroke_index}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align="center">OUT</TableCell>
                <TableCell align="center">TOT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map(player => {
                const handicapStrokes = calculateHandicapStrokes(player.handicap, player.holes || []);
                const { backNine } = playerHoles[player.id];
                const { grossTotal: backGrossTotal, netTotal: backNetTotal } = calculateTotals(player.id, backNine, scores, handicapStrokes);
                const { grossTotal: totalGross, netTotal: totalNet } = calculateTotals(player.id, player.holes || [], scores, handicapStrokes);
                
                return (
                  <TableRow key={player.id}>
                    <TableCell>
                      {player.name}
                      <br />
                      <Typography variant="caption">
                        HCP: {player.handicap}
                        <br />
                        {playerTees[player.id]?.name}
                      </Typography>
                    </TableCell>
                    {backNine.map(hole => {
                      const grossScore = scores[player.id]?.[hole.number] || null;
                      const netScore = calculateNetScore(grossScore, handicapStrokes[hole.number] || 0);
                      
                      return (
                        <TableCell key={hole.id} align="center" sx={{ position: 'relative' }}>
                          <Box sx={{ color: getScoreColor(grossScore, hole.par) }}>
                            <EditScoreCell
                              currentScore={grossScore}
                              onSave={(score) => onScoreChange(player.id, hole.number, score)}
                            />
                          </Box>
                          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {netScore !== null ? netScore : '-'}
                          </Box>
                          {handicapStrokes[hole.number] > 0 && (
                            <Typography
                              variant="caption"
                              sx={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                fontSize: '0.6rem',
                              }}
                            >
                              {'*'.repeat(handicapStrokes[hole.number])}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell align="center">
                      {backGrossTotal}
                      <br />
                      <Typography variant="caption">
                        {backNetTotal}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {totalGross}
                      <br />
                      <Typography variant="caption">
                        {totalNet}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        {onEndRound && (
          <Button variant="contained" color="primary" onClick={onEndRound}>
            End Round
          </Button>
        )}
        {onDiscardRound && (
          <Button variant="outlined" color="error" onClick={onDiscardRound}>
            Discard Round
          </Button>
        )}
      </Box>
    </Box>
  );
};
