import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

interface BankerGameProps {
  scores: { [key: string]: { [key: number]: number | null } };
  playerCount: number;
  holes: { number: number }[];
  holeSetups: { [key: number]: HoleSetup };
  onHoleSetupChange: (holeNumber: number, setup: Partial<HoleSetup>) => void;
}

interface HoleSetup {
  banker: number | null;
  dots: number;
  doubles: { [key: number]: boolean };
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '8px 16px',
  '&.header': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 'bold',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const BankerGame: React.FC<BankerGameProps> = ({
  scores,
  playerCount,
  holes,
  holeSetups,
  onHoleSetupChange,
}) => {
  const [totalPoints, setTotalPoints] = React.useState<number[]>(Array(playerCount).fill(0));

  React.useEffect(() => {
    const newTotalPoints = Array(playerCount).fill(0);

    // For each hole
    holes.forEach((hole) => {
      const holeNumber = hole.number;
      const setup = holeSetups[holeNumber];
      
      if (setup.banker === null) return;

      // Compare banker's score with each other player
      for (let i = 0; i < playerCount; i++) {
        if (i === setup.banker) continue;

        const bankerScore = scores[`player${setup.banker}`]?.[holeNumber];
        const playerScore = scores[`player${i}`]?.[holeNumber];

        if (bankerScore !== null && playerScore !== null) {
          let points = setup.dots;
          
          // Apply doubles
          if (setup.doubles[setup.banker]) points *= 2;
          if (setup.doubles[i]) points *= 2;

          if (bankerScore < playerScore) {
            // Banker wins
            newTotalPoints[setup.banker] += points;
          } else if (bankerScore > playerScore) {
            // Player wins
            newTotalPoints[i] += points;
          }
          // Tie results in no points
        }
      }
    });

    setTotalPoints(newTotalPoints);
  }, [scores, playerCount, holes, holeSetups]);

  const handleBankerChange = (holeNumber: number, value: string) => {
    onHoleSetupChange(holeNumber, {
      banker: value === '' ? null : parseInt(value, 10),
    });
  };

  const handleDotsChange = (holeNumber: number, value: string) => {
    const dots = parseInt(value) || 1;
    onHoleSetupChange(holeNumber, { dots });
  };

  const handleDoubleToggle = (holeNumber: number, playerIndex: number) => {
    const setup = holeSetups[holeNumber];
    onHoleSetupChange(holeNumber, {
      doubles: {
        ...setup.doubles,
        [playerIndex]: !setup.doubles[playerIndex],
      },
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Banker Game
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell className="header">Hole</StyledTableCell>
              <StyledTableCell className="header">Banker</StyledTableCell>
              <StyledTableCell className="header">Dots</StyledTableCell>
              <StyledTableCell className="header">Doubles</StyledTableCell>
              <StyledTableCell className="header">Result</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holes.map((hole) => {
              const holeNumber = hole.number;
              const setup = holeSetups[holeNumber];

              return (
                <StyledTableRow key={holeNumber}>
                  <StyledTableCell>{holeNumber}</StyledTableCell>
                  <StyledTableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={setup.banker === null ? '' : setup.banker.toString()}
                        onChange={(e) => handleBankerChange(holeNumber, e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Select Banker</MenuItem>
                        {Array.from({ length: playerCount }).map((_, i) => (
                          <MenuItem key={i} value={i.toString()}>Player {i + 1}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={setup.dots}
                      onChange={(e) => handleDotsChange(holeNumber, e.target.value)}
                      inputProps={{ min: 1, style: { width: '60px' } }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {Array.from({ length: playerCount }).map((_, i) => (
                        <FormControlLabel
                          key={i}
                          control={
                            <Checkbox
                              checked={setup.doubles[i]}
                              onChange={() => handleDoubleToggle(holeNumber, i)}
                              size="small"
                            />
                          }
                          label={`P${i + 1}`}
                        />
                      ))}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>
                    {setup.banker !== null && scores[`player${setup.banker}`]?.[holeNumber] !== null
                      ? Array.from({ length: playerCount }).map((_, i) => {
                          if (i === setup.banker) return null;
                          const bankerScore = scores[`player${setup.banker || 0}`]?.[holeNumber];
                          const playerScore = scores[`player${i}`]?.[holeNumber];
                          if (bankerScore === null || playerScore === null) return null;

                          let points = setup.dots;
                          if (setup.doubles[setup.banker || 0]) points *= 2;
                          if (setup.doubles[i]) points *= 2;

                          if (bankerScore < playerScore) {
                            return `Banker wins ${points} from P${i + 1}`;
                          } else if (bankerScore > playerScore) {
                            return `P${i + 1} wins ${points}`;
                          }
                          return `Tie with P${i + 1}`;
                        }).filter(Boolean).join(', ')
                      : '-'
                    }
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Total Points
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {Array.from({ length: playerCount }).map((_, i) => (
                  <StyledTableCell key={i} className="header">
                    Player {i + 1}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {totalPoints.map((points, i) => (
                  <StyledTableCell key={i}>{points}</StyledTableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};
