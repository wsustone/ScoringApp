import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  styled,
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

const calculateSum = (holes: Hole[], start: number, end: number, property: keyof Hole): number => {
  return holes
    .filter(hole => hole.number >= start && hole.number <= end)
    .reduce((sum, hole) => sum + hole[property], 0);
};

const StyledTableCell = styled(TableCell)({
  border: '1px solid rgba(0, 0, 0, 0.2)',
  padding: '6px',
  '&.divider': {
    borderLeft: '2px solid rgba(0, 0, 0, 0.3)',
  },
  '&.header': {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
});

const StyledTableRow = styled(TableRow)({
  '&:last-child td, &:last-child th': {
    borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
  },
  '& th': {
    borderRight: '2px solid rgba(0, 0, 0, 0.3)',
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  '&:nth-of-type(even)': {
    backgroundColor: '#fafafa',
  },
});

const StyledTable = styled(Table)({
  borderCollapse: 'collapse',
  '& th, & td': {
    borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
  },
});

const StyledStars = styled('div')({
  position: 'absolute',
  top: 0,
  right: 2,
  fontSize: '0.7rem',
  color: '#FFB100',
  lineHeight: 1,
});

const getScoreColor = (score: number | null, par: number) => {
  if (score === null) return 'inherit';
  if (score < par) return '#E53935'; // red
  if (score === par) return '#1E88E5'; // blue
  return '#000000'; // black
};

const calculatePlayerSum = (scores: { [key: number]: number | null }, start: number, end: number): number | null => {
  let sum = 0;
  let hasScores = false;
  for (let i = start; i <= end; i++) {
    if (scores[i] !== null) {
      sum += scores[i] || 0;
      hasScores = true;
    }
  }
  return hasScores ? sum : null;
};

const getHandicapStrokes = (handicap: number | null, strokeIndex: number, holes: Hole[]): number => {
  if (!handicap) return 0;
  
  // Sort holes by stroke index in ascending order (lowest first)
  const sortedHoles = [...holes].sort((a, b) => a.strokeIndex - b.strokeIndex);
  const targetHole = holes.find(h => h.strokeIndex === strokeIndex);
  if (!targetHole) return 0;

  // Find position of this hole in the sorted list (0-based)
  const strokeOrder = sortedHoles.findIndex(h => h.strokeIndex === strokeIndex);
  if (strokeOrder === -1) return 0;

  // Calculate strokes for this hole
  const quotient = Math.floor(handicap / 18);
  const remainder = handicap % 18;
  
  // Everyone gets the base strokes
  let strokes = quotient;
  
  // Add extra stroke if this hole's position is within the remainder
  if (strokeOrder < remainder) {
    strokes++;
  }

  return strokes;
};

export const Scorecard: React.FC<ScorecardProps> = ({ holes }) => {
  const playerNames = Array(4).fill('');
  const rows = ['Hole', 'Distance', 'Par', 'SI', ...playerNames.map((_, i) => `Player ${i + 1}`)];
  
  // Create a state object for each player's scores and handicaps
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>(
    playerNames.reduce((acc, _, playerIndex) => ({
      ...acc,
      [`player${playerIndex}`]: holes.reduce((holeAcc, hole) => ({
        ...holeAcc,
        [hole.number]: null,
      }), {}),
    }), {})
  );

  const [handicaps, setHandicaps] = useState<{ [key: string]: number | null }>(
    playerNames.reduce((acc, _, playerIndex) => ({
      ...acc,
      [`player${playerIndex}`]: null,
    }), {})
  );

  const handleScoreChange = (playerIndex: number, holeNumber: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    setScores(prev => ({
      ...prev,
      [`player${playerIndex}`]: {
        ...prev[`player${playerIndex}`],
        [holeNumber]: numValue,
      },
    }));
  };

  const handleHandicapChange = (playerIndex: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    setHandicaps(prev => ({
      ...prev,
      [`player${playerIndex}`]: numValue,
    }));
  };

  const getPlayerInScore = (playerIndex: number) => {
    return calculatePlayerSum(scores[`player${playerIndex}`], 1, 9);
  };

  const getPlayerOutScore = (playerIndex: number) => {
    return calculatePlayerSum(scores[`player${playerIndex}`], 10, 18);
  };

  const getPlayerTotalScore = (playerIndex: number) => {
    const inScore = getPlayerInScore(playerIndex);
    const outScore = getPlayerOutScore(playerIndex);
    if (inScore === null && outScore === null) return null;
    return (inScore || 0) + (outScore || 0);
  };

  const getParForHoles = (start: number, end: number) => {
    return calculateSum(holes, start, end, 'par');
  };

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 2,
        '& .MuiPaper-root': {
          border: '2px solid rgba(0, 0, 0, 0.3)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      }}
    >
      <StyledTable size="small">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell className="header"></StyledTableCell>
            <StyledTableCell align="center" className="header">HCP</StyledTableCell>
            {holes.slice(0, 9).map((hole) => (
              <StyledTableCell key={hole.number} align="center" className="header">
                {hole.number}
              </StyledTableCell>
            ))}
            <StyledTableCell align="center" className="divider header">In</StyledTableCell>
            {holes.slice(9).map((hole) => (
              <StyledTableCell key={hole.number} align="center" className="header">
                {hole.number}
              </StyledTableCell>
            ))}
            <StyledTableCell align="center" className="divider header">Out</StyledTableCell>
            <StyledTableCell align="center" className="header">Total</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <StyledTableRow key={row}>
              <StyledTableCell component="th" scope="row">
                {rowIndex >= 4 ? (
                  <TextField
                    size="small"
                    placeholder={row}
                    variant="standard"
                  />
                ) : (
                  row
                )}
              </StyledTableCell>
              <StyledTableCell align="center">
                {rowIndex >= 4 ? (
                  <TextField
                    size="small"
                    type="number"
                    variant="standard"
                    value={handicaps[`player${rowIndex - 4}`] ?? ''}
                    onChange={(e) => handleHandicapChange(rowIndex - 4, e.target.value)}
                    inputProps={{ 
                      min: 0,
                      max: 54,
                      style: { 
                        width: '40px',
                        textAlign: 'center',
                      }
                    }}
                  />
                ) : ''}
              </StyledTableCell>
              {holes.slice(0, 9).map((hole) => (
                <StyledTableCell 
                  key={`${row}-${hole.number}`} 
                  align="center"
                  sx={{ position: 'relative' }}
                >
                  {rowIndex === 0 ? hole.number :
                   rowIndex === 1 ? hole.distance :
                   rowIndex === 2 ? hole.par :
                   rowIndex === 3 ? hole.strokeIndex : (
                    <>
                      <StyledStars>
                        {'★'.repeat(getHandicapStrokes(handicaps[`player${rowIndex - 4}`], hole.strokeIndex, holes))}
                      </StyledStars>
                      <TextField
                        size="small"
                        type="number"
                        variant="standard"
                        value={scores[`player${rowIndex - 4}`][hole.number] ?? ''}
                        onChange={(e) => handleScoreChange(rowIndex - 4, hole.number, e.target.value)}
                        inputProps={{ 
                          min: 1,
                          style: { 
                            width: '40px',
                            textAlign: 'center',
                            color: getScoreColor(scores[`player${rowIndex - 4}`][hole.number], hole.par),
                          }
                        }}
                      />
                    </>
                  )}
                </StyledTableCell>
              ))}
              <StyledTableCell align="center" className="divider">
                {rowIndex === 1 ? calculateSum(holes, 1, 9, 'distance') :
                 rowIndex === 2 ? calculateSum(holes, 1, 9, 'par') :
                 rowIndex === 3 ? '' : (
                  rowIndex >= 4 ? (
                    <TextField
                      size="small"
                      type="number"
                      variant="standard"
                      value={getPlayerInScore(rowIndex - 4) ?? ''}
                      inputProps={{ 
                        min: 1,
                        style: { 
                          width: '40px',
                          textAlign: 'center',
                          color: getScoreColor(getPlayerInScore(rowIndex - 4), getParForHoles(1, 9)),
                        }
                      }}
                      disabled
                    />
                  ) : ''
                )}
              </StyledTableCell>
              {holes.slice(9).map((hole) => (
                <StyledTableCell 
                  key={`${row}-${hole.number}`} 
                  align="center"
                  sx={{ position: 'relative' }}
                >
                  {rowIndex === 0 ? hole.number :
                   rowIndex === 1 ? hole.distance :
                   rowIndex === 2 ? hole.par :
                   rowIndex === 3 ? hole.strokeIndex : (
                    <>
                      <StyledStars>
                        {'★'.repeat(getHandicapStrokes(handicaps[`player${rowIndex - 4}`], hole.strokeIndex, holes))}
                      </StyledStars>
                      <TextField
                        size="small"
                        type="number"
                        variant="standard"
                        value={scores[`player${rowIndex - 4}`][hole.number] ?? ''}
                        onChange={(e) => handleScoreChange(rowIndex - 4, hole.number, e.target.value)}
                        inputProps={{ 
                          min: 1,
                          style: { 
                            width: '40px',
                            textAlign: 'center',
                            color: getScoreColor(scores[`player${rowIndex - 4}`][hole.number], hole.par),
                          }
                        }}
                      />
                    </>
                  )}
                </StyledTableCell>
              ))}
              <StyledTableCell align="center" className="divider">
                {rowIndex === 1 ? calculateSum(holes, 10, 18, 'distance') :
                 rowIndex === 2 ? calculateSum(holes, 10, 18, 'par') :
                 rowIndex === 3 ? '' : (
                  rowIndex >= 4 ? (
                    <TextField
                      size="small"
                      type="number"
                      variant="standard"
                      value={getPlayerOutScore(rowIndex - 4) ?? ''}
                      inputProps={{ 
                        min: 1,
                        style: { 
                          width: '40px',
                          textAlign: 'center',
                          color: getScoreColor(getPlayerOutScore(rowIndex - 4), getParForHoles(10, 18)),
                        }
                      }}
                      disabled
                    />
                  ) : ''
                )}
              </StyledTableCell>
              <StyledTableCell align="center">
                {rowIndex === 1 ? calculateSum(holes, 1, 18, 'distance') :
                 rowIndex === 2 ? calculateSum(holes, 1, 18, 'par') :
                 rowIndex === 3 ? '' : (
                  rowIndex >= 4 ? (
                    <TextField
                      size="small"
                      type="number"
                      variant="standard"
                      value={getPlayerTotalScore(rowIndex - 4) ?? ''}
                      inputProps={{ 
                        min: 1,
                        style: { 
                          width: '40px',
                          textAlign: 'center',
                          color: getScoreColor(getPlayerTotalScore(rowIndex - 4), getParForHoles(1, 18)),
                        }
                      }}
                      disabled
                    />
                  ) : ''
                )}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};
