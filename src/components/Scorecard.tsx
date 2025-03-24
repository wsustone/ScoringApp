import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Player } from './PlayerForm';
import { Hole } from '../types';

interface ScorecardProps {
  holes: Hole[];
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  '&.header': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

export const Scorecard: React.FC<ScorecardProps> = ({
  holes,
  players,
  scores,
  onScoreChange,
}) => {
  const getParTotal = (startHole: number, endHole: number): number => {
    return holes
      .filter(hole => hole.number >= startHole && hole.number <= endHole)
      .reduce((sum, hole) => sum + hole.par, 0);
  };

  const getPlayerTotal = (playerId: string, startHole: number, endHole: number): number | null => {
    const playerScores = scores[playerId];
    if (!playerScores) return null;

    let total = 0;
    let hasValidScore = false;

    for (let i = startHole; i <= endHole; i++) {
      const score = playerScores[i];
      if (score !== null) {
        total += score;
        hasValidScore = true;
      }
    }

    return hasValidScore ? total : null;
  };

  const handleScoreChange = (playerId: string, holeNumber: number, value: string) => {
    const score = value === '' ? null : parseInt(value, 10);
    onScoreChange(playerId, holeNumber, score);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Scorecard
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell className="header">Hole</StyledTableCell>
              {holes.map((hole) => (
                <StyledTableCell key={hole.number} align="center" className="header">
                  {hole.number}
                </StyledTableCell>
              ))}
              <StyledTableCell align="center" className="header">Out</StyledTableCell>
              <StyledTableCell align="center" className="header">In</StyledTableCell>
              <StyledTableCell align="center" className="header">Total</StyledTableCell>
            </TableRow>

            <TableRow>
              <StyledTableCell>Par</StyledTableCell>
              {holes.map((hole) => (
                <StyledTableCell key={hole.number} align="center">
                  {hole.par}
                </StyledTableCell>
              ))}
              <StyledTableCell align="center">{getParTotal(1, 9)}</StyledTableCell>
              <StyledTableCell align="center">{getParTotal(10, 18)}</StyledTableCell>
              <StyledTableCell align="center">{getParTotal(1, 18)}</StyledTableCell>
            </TableRow>

            <TableRow>
              <StyledTableCell>HCP</StyledTableCell>
              {holes.map((hole) => (
                <StyledTableCell key={hole.number} align="center">
                  {hole.handicap}
                </StyledTableCell>
              ))}
              <StyledTableCell align="center">-</StyledTableCell>
              <StyledTableCell align="center">-</StyledTableCell>
              <StyledTableCell align="center">-</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <StyledTableCell>
                  {player.name} ({player.handicap})
                </StyledTableCell>
                {holes.map((hole) => (
                  <StyledTableCell key={hole.number} align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={scores[player.id]?.[hole.number] ?? ''}
                      onChange={(e) => handleScoreChange(player.id, hole.number, e.target.value)}
                      inputProps={{
                        min: 1,
                        style: { textAlign: 'center', width: '2em' },
                      }}
                    />
                  </StyledTableCell>
                ))}
                <StyledTableCell align="center">
                  {getPlayerTotal(player.id, 1, 9) ?? '-'}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {getPlayerTotal(player.id, 10, 18) ?? '-'}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {getPlayerTotal(player.id, 1, 18) ?? '-'}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
