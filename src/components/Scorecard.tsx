import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';
import { Player } from './PlayerForm';
import { GolfHole } from '../types/game';

interface ScorecardProps {
  holes: GolfHole[];
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
}

export const Scorecard = ({ holes, players, scores, onScoreChange }: ScorecardProps) => {
  const frontNine = holes.filter(h => h.number <= 9);
  const backNine = holes.filter(h => h.number > 9);

  const calculateTotal = (playerId: string, holes: GolfHole[]) => {
    return holes.reduce((total, hole) => {
      const score = scores[playerId]?.[hole.number];
      return total + (score || 0);
    }, 0);
  };

  const calculateParTotal = (holes: GolfHole[]) => {
    return holes.reduce((total, hole) => total + hole.par, 0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Front Nine</Typography>
      <Paper sx={{ mb: 4, overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              {frontNine.map(hole => (
                <TableCell key={hole.number} align="center">{hole.number}</TableCell>
              ))}
              <TableCell align="center">Total</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Par</TableCell>
              {frontNine.map(hole => (
                <TableCell key={hole.number} align="center">{hole.par}</TableCell>
              ))}
              <TableCell align="center">{calculateParTotal(frontNine)}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                {frontNine.map(hole => (
                  <TableCell key={hole.number} align="center">
                    <Box
                      component="input"
                      type="number"
                      min="1"
                      max="20"
                      value={scores[player.id]?.[hole.number] || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : null;
                        if (value !== null && (value < 1 || value > 20)) return;
                        onScoreChange(player.id, hole.number, value);
                      }}
                      sx={{
                        width: '40px',
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'grey.400',
                        borderRadius: '4px',
                        padding: '4px',
                        backgroundColor: 'background.paper',
                        color: scores[player.id]?.[hole.number] && hole.par
                          ? scores[player.id]?.[hole.number] < hole.par 
                            ? 'error.main'
                            : scores[player.id]?.[hole.number] === hole.par 
                              ? 'primary.main'
                              : 'text.primary'
                          : 'text.primary',
                        '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                          display: 'none'
                        },
                        appearance: 'textfield'
                      }}
                    />
                  </TableCell>
                ))}
                <TableCell align="center">{calculateTotal(player.id, frontNine)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h6" gutterBottom>Back Nine</Typography>
      <Paper sx={{ mb: 4, overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              {backNine.map(hole => (
                <TableCell key={hole.number} align="center">{hole.number}</TableCell>
              ))}
              <TableCell align="center">Total</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Par</TableCell>
              {backNine.map(hole => (
                <TableCell key={hole.number} align="center">{hole.par}</TableCell>
              ))}
              <TableCell align="center">{calculateParTotal(backNine)}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                {backNine.map(hole => (
                  <TableCell key={hole.number} align="center">
                    <Box
                      component="input"
                      type="number"
                      min="1"
                      max="20"
                      value={scores[player.id]?.[hole.number] || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : null;
                        if (value !== null && (value < 1 || value > 20)) return;
                        onScoreChange(player.id, hole.number, value);
                      }}
                      sx={{
                        width: '40px',
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'grey.400',
                        borderRadius: '4px',
                        padding: '4px',
                        backgroundColor: 'background.paper',
                        color: scores[player.id]?.[hole.number] && hole.par
                          ? scores[player.id]?.[hole.number] < hole.par 
                            ? 'error.main'
                            : scores[player.id]?.[hole.number] === hole.par 
                              ? 'primary.main'
                              : 'text.primary'
                          : 'text.primary',
                        '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                          display: 'none'
                        },
                        appearance: 'textfield'
                      }}
                    />
                  </TableCell>
                ))}
                <TableCell align="center">{calculateTotal(player.id, backNine)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h6" gutterBottom>Total</Typography>
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="center">Front</TableCell>
              <TableCell align="center">Back</TableCell>
              <TableCell align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Par</TableCell>
              <TableCell align="center">{calculateParTotal(frontNine)}</TableCell>
              <TableCell align="center">{calculateParTotal(backNine)}</TableCell>
              <TableCell align="center">{calculateParTotal(holes)}</TableCell>
            </TableRow>
            {players.map(player => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell align="center">{calculateTotal(player.id, frontNine)}</TableCell>
                <TableCell align="center">{calculateTotal(player.id, backNine)}</TableCell>
                <TableCell align="center">{calculateTotal(player.id, holes)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
