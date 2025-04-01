import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';
import { Player } from './PlayerForm';
import { Hole, GolfTee } from '../types/game';
import { calculateHandicapStrokes } from '../utils/handicapScoring';

interface HoleWithIndex extends Omit<Hole, 'roundId'> {
  scoringIndex: number;
}

interface ExtendedGolfTee extends Omit<GolfTee, 'holes'> {
  holes: HoleWithIndex[];
}

interface ScorecardProps {
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
  playerTees: { [key: string]: ExtendedGolfTee };
}

export const Scorecard: React.FC<ScorecardProps> = ({
  players,
  scores,
  onScoreChange,
  playerTees,
}) => {
  const firstTee = Object.values(playerTees)[0];
  if (!firstTee) return null;

  const getFrontNine = (holes: HoleWithIndex[]) => 
    [...holes].filter(h => h.holeNumber <= 9).sort((a, b) => a.holeNumber - b.holeNumber);

  const getBackNine = (holes: HoleWithIndex[]) => 
    [...holes].filter(h => h.holeNumber > 9).sort((a, b) => a.holeNumber - b.holeNumber);

  const frontNine = getFrontNine(firstTee.holes);
  const backNine = getBackNine(firstTee.holes);

  const renderScoreInput = (player: Player, hole: HoleWithIndex, showNet: boolean = false) => {
    const score = scores[player.id]?.[hole.holeNumber];
    const tee = playerTees[player.id];
    if (!tee) return null;

    // Calculate handicap strokes for this hole
    const handicapStrokes = player.handicap ? calculateHandicapStrokes(player.handicap, hole.scoringIndex) : 0;

    const netScore = score !== null && score !== undefined ? score - handicapStrokes : null;

    const getScoreColor = (score: number, par: number) => {
      if (score < par) return 'error.main'; // Under par (good) in red
      if (score === par) return 'primary.main'; // Par in primary color
      return 'text.primary'; // Over par in normal text color
    };

    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: showNet ? '48px' : '24px',
          '&::before': handicapStrokes > 0 ? {
            content: `"${handicapStrokes > 1 ? '*'.repeat(handicapStrokes) : '*'}"`,
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            color: 'primary.main'
          } : undefined
        }}
      >
        <Box
          component="input"
          type="number"
          min="1"
          max="20"
          value={score ?? ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value, 10) : null;
            if (value !== null && (value < 1 || value > 20)) return;
            onScoreChange(player.id, hole.holeNumber, value);
          }}
          sx={{
            width: '100%',
            height: '24px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '4px',
            padding: '2px',
            textAlign: 'center',
            backgroundColor: 'background.paper',
            color: score !== null && score !== undefined
              ? getScoreColor(score, hole.par)
              : 'text.primary',
            '&::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '&::-webkit-outer-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
          }}
        />
        {showNet && netScore !== null && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: '2px',
              color: getScoreColor(netScore, 0) // For net scores, par is 0
            }}
          >
            {netScore}
          </Typography>
        )}
      </Box>
    );
  };

  const renderSection = (holes: HoleWithIndex[], isBackNine: boolean = false) => {
    const calculateNetTotal = (player: Player, holes: HoleWithIndex[]) => {
      let total = 0;
      let validScores = false;
      
      holes.forEach(hole => {
        const score = scores[player.id]?.[hole.holeNumber];
        if (score !== null && score !== undefined) {
          validScores = true;
          const handicapStrokes = player.handicap ? calculateHandicapStrokes(player.handicap, hole.scoringIndex) : 0;
          total += (score - handicapStrokes);
        }
      });

      return validScores ? total : null;
    };

    const calculateGrossTotal = (player: Player, holes: HoleWithIndex[]) => {
      let total = 0;
      let validScores = false;

      holes.forEach(hole => {
        const score = scores[player.id]?.[hole.holeNumber];
        if (score !== null && score !== undefined) {
          validScores = true;
          total += score;
        }
      });

      return validScores ? total : null;
    };

    return (
      <Table size="small" sx={{ 
        '& .MuiTableCell-root': { 
          padding: '4px',
          borderColor: 'divider',
          whiteSpace: 'nowrap'
        }
      }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.100' }}>
            <TableCell sx={{ minWidth: '180px' }}>Player</TableCell>
            {holes.map(hole => (
              <TableCell key={hole.id} align="center" sx={{ minWidth: '40px' }}>
                {hole.holeNumber}
              </TableCell>
            ))}
            <TableCell align="center">{isBackNine ? 'Out' : 'In'}</TableCell>
            {isBackNine && <TableCell align="center">Total</TableCell>}
          </TableRow>
          <TableRow sx={{ backgroundColor: 'grey.50' }}>
            <TableCell>Par</TableCell>
            {holes.map(hole => (
              <TableCell key={hole.id} align="center">
                {hole.par}
              </TableCell>
            ))}
            <TableCell align="center">
              {holes.reduce((sum, hole) => sum + hole.par, 0)}
            </TableCell>
            {isBackNine && (
              <TableCell align="center">
                {firstTee.holes.reduce((sum, hole) => sum + hole.par, 0)}
              </TableCell>
            )}
          </TableRow>
          <TableRow sx={{ backgroundColor: 'grey.50' }}>
            <TableCell>Index</TableCell>
            {holes.map(hole => (
              <TableCell key={hole.id} align="center">
                {hole.scoringIndex}
              </TableCell>
            ))}
            <TableCell align="center">-</TableCell>
            {isBackNine && <TableCell align="center">-</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map(player => {
            const tee = playerTees[player.id];
            if (!tee) return null;

            const frontNineGross = calculateGrossTotal(player, getFrontNine(firstTee.holes));
            const backNineGross = calculateGrossTotal(player, getBackNine(firstTee.holes));
            const frontNineNet = calculateNetTotal(player, getFrontNine(firstTee.holes));
            const backNineNet = calculateNetTotal(player, getBackNine(firstTee.holes));

            return (
              <TableRow key={player.id}>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {player.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" noWrap>
                    {tee.name} ({tee.gender}) • HCP: {player.handicap || 0}
                  </Typography>
                </TableCell>
                {holes.map(hole => (
                  <TableCell 
                    key={`${player.id}-${hole.id}`} 
                    padding="none" 
                    align="center"
                    sx={{ height: '48px' }}
                  >
                    {renderScoreInput(player, hole, true)}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {isBackNine ? backNineGross ?? '-' : frontNineGross ?? '-'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {isBackNine ? backNineNet ?? '-' : frontNineNet ?? '-'}
                    </Typography>
                  </Box>
                </TableCell>
                {isBackNine && (
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {frontNineGross !== null && backNineGross !== null 
                          ? frontNineGross + backNineGross 
                          : '-'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {frontNineNet !== null && backNineNet !== null 
                          ? frontNineNet + backNineNet 
                          : '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Paper elevation={2} sx={{ mb: 3 }}>
        {renderSection(frontNine)}
      </Paper>
      <Paper elevation={2}>
        {renderSection(backNine, true)}
      </Paper>
    </Box>
  );
};
