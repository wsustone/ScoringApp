import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Player } from './PlayerForm';
import { Hole, HoleSetup } from '../types';

interface BankerGameProps {
  scores: { [key: string]: { [key: number]: number | null } };
  holes: Hole[];
  holeSetups: { [key: number]: HoleSetup };
  onHoleSetupChange: (holeNumber: number, setup: Partial<HoleSetup>) => void;
  players: Player[];
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  '&.header': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

export const BankerGame: React.FC<BankerGameProps> = ({
  scores,
  holes,
  holeSetups,
  onHoleSetupChange,
  players,
}) => {
  const handleBankerChange = (holeNumber: number, event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onHoleSetupChange(holeNumber, {
      banker: value === '' ? null : value,
    });
  };

  const handleDotsChange = (holeNumber: number, value: string) => {
    onHoleSetupChange(holeNumber, {
      dots: parseInt(value, 10) || 1,
    });
  };

  const handleDoubleChange = (holeNumber: number, playerId: string, checked: boolean) => {
    const currentSetup = holeSetups[holeNumber] || { banker: null, dots: 1, doubles: {} };
    onHoleSetupChange(holeNumber, {
      doubles: {
        ...currentSetup.doubles,
        [playerId]: checked,
      },
    });
  };

  const getHolePoints = (holeNumber: number, setup: HoleSetup): string => {
    if (!setup.banker || !scores[setup.banker]?.[holeNumber]) return '-';

    const bankerScore = scores[setup.banker][holeNumber];
    const results: string[] = [];

    players.forEach(player => {
      if (player.id === setup.banker) return;

      const playerScore = scores[player.id]?.[holeNumber];
      if (playerScore === null || bankerScore === null) return;

      let points = setup.dots;
      if (setup.banker && setup.doubles[setup.banker]) points *= 2;
      if (setup.doubles[player.id]) points *= 2;

      if (bankerScore < playerScore) {
        results.push(`Banker wins ${points} from ${player.name}`);
      } else if (bankerScore > playerScore) {
        results.push(`${player.name} wins ${points}`);
      } else {
        results.push(`Tie with ${player.name}`);
      }
    });

    return results.length ? results.join(', ') : '-';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Banker Game Setup
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell className="header">Hole</StyledTableCell>
              <StyledTableCell className="header">Par</StyledTableCell>
              <StyledTableCell className="header">Banker</StyledTableCell>
              <StyledTableCell className="header">Dots</StyledTableCell>
              <StyledTableCell className="header" align="center">Doubles</StyledTableCell>
              <StyledTableCell className="header">Results</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holes.map((hole) => {
              const setup = holeSetups[hole.number] || { banker: null, dots: 1, doubles: {} };
              return (
                <TableRow key={hole.number}>
                  <StyledTableCell>{hole.number}</StyledTableCell>
                  <StyledTableCell>{hole.par}</StyledTableCell>
                  <StyledTableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={setup.banker || ''}
                        onChange={(e) => handleBankerChange(hole.number, e)}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Select Banker</em>
                        </MenuItem>
                        {players.map((player) => (
                          <MenuItem key={player.id} value={player.id}>
                            {player.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={setup.dots}
                      onChange={(e) => handleDotsChange(hole.number, e.target.value)}
                      inputProps={{ min: 1, max: 5 }}
                      sx={{ width: 80 }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      {players.map((player) => (
                        <Box key={player.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Checkbox
                            size="small"
                            checked={setup.doubles[player.id] || false}
                            onChange={(e) => handleDoubleChange(hole.number, player.id, e.target.checked)}
                            disabled={setup.banker === player.id}
                          />
                          <Typography variant="caption">
                            {player.name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>
                    {getHolePoints(hole.number, setup)}
                  </StyledTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
