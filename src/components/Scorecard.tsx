import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';

interface Hole {
  number: number;
  par: number;
  strokeIndex: number;
  distance: number;
}

interface ScorecardProps {
  holes: Hole[];
}

export const Scorecard: React.FC<ScorecardProps> = ({ holes }) => {
  const playerNames = Array(6).fill('');

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hole</TableCell>
            <TableCell>Par</TableCell>
            <TableCell>SI</TableCell>
            {playerNames.map((_, index) => (
              <TableCell key={index}>
                <TextField
                  size="small"
                  placeholder={`Player ${index + 1}`}
                  variant="standard"
                />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {holes.map((hole) => (
            <TableRow key={hole.number}>
              <TableCell>{hole.number}</TableCell>
              <TableCell>{hole.par}</TableCell>
              <TableCell>{hole.strokeIndex}</TableCell>
              {playerNames.map((_, index) => (
                <TableCell key={index}>
                  <TextField
                    size="small"
                    type="number"
                    variant="standard"
                    inputProps={{ min: 1, style: { width: '40px' } }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
