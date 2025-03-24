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
  const playerNames = Array(4).fill('');
  const rows = ['Hole', 'Distance', 'Par', 'SI', ...playerNames.map((_, i) => `Player ${i + 1}`)];

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            {holes.map((hole) => (
              <TableCell key={hole.number} align="center">
                {hole.number}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={row}>
              <TableCell component="th" scope="row">
                {rowIndex >= 4 ? (
                  <TextField
                    size="small"
                    placeholder={row}
                    variant="standard"
                  />
                ) : (
                  row
                )}
              </TableCell>
              {holes.map((hole) => (
                <TableCell key={`${row}-${hole.number}`} align="center">
                  {rowIndex === 0 ? (
                    hole.number
                  ) : rowIndex === 1 ? (
                    hole.distance
                  ) : rowIndex === 2 ? (
                    hole.par
                  ) : rowIndex === 3 ? (
                    hole.strokeIndex
                  ) : (
                    <TextField
                      size="small"
                      type="number"
                      variant="standard"
                      inputProps={{ min: 1, style: { width: '40px', textAlign: 'center' } }}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
