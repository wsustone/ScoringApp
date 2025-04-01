import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';
import { Player } from './PlayerForm';

interface GolfHole {
  id: string;
  holeNumber: number;
  par: number;
  scoringIndex: number;
}

interface ScorecardProps {
  holes: GolfHole[];
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
}

export const Scorecard = ({ holes, players, scores, onScoreChange }: ScorecardProps) => {
  const frontNine = holes.filter(h => h.holeNumber <= 9);
  const backNine = holes.filter(h => h.holeNumber > 9);

  const calculateTotal = (playerId: string, holes: GolfHole[]) => {
    return holes.reduce((total, hole) => {
      const score = scores[playerId]?.[hole.holeNumber];
      return total + (score ?? 0);
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
                <TableCell key={hole.id} align="center">{hole.holeNumber}</TableCell>
              ))}
              <TableCell align="center">Total</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Par</TableCell>
              {frontNine.map(hole => (
                <TableCell key={hole.id} align="center">{hole.par}</TableCell>
              ))}
              <TableCell align="center">{calculateParTotal(frontNine)}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                {frontNine.map(hole => (
                  <TableCell key={hole.id} align="center">
                    <Box
                      component="input"
                      type="number"
                      min="1"
                      max="20"
                      value={scores[player.id]?.[hole.holeNumber] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : null;
                        if (value !== null && (value < 1 || value > 20)) return;
                        onScoreChange(player.id, hole.holeNumber, value);
                      }}
                      sx={{
                        width: '40px',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                        padding: '4px',
                        backgroundColor: 'background.paper',
                        color: (scores[player.id]?.[hole.holeNumber] ?? null) !== null
                          ? scores[player.id]?.[hole.holeNumber]! < hole.par
                            ? 'error.main'
                            : scores[player.id]?.[hole.holeNumber] === hole.par
                              ? 'primary.main'
                              : 'text.primary'
                          : 'text.primary',
                        textAlign: 'center',
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
                  </TableCell>
                ))}
                <TableCell align="center">{calculateTotal(player.id, frontNine)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h6" gutterBottom>Back Nine</Typography>
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              {backNine.map(hole => (
                <TableCell key={hole.id} align="center">{hole.holeNumber}</TableCell>
              ))}
              <TableCell align="center">Total</TableCell>
              <TableCell align="center">Total Score</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Par</TableCell>
              {backNine.map(hole => (
                <TableCell key={hole.id} align="center">{hole.par}</TableCell>
              ))}
              <TableCell align="center">{calculateParTotal(backNine)}</TableCell>
              <TableCell align="center">{calculateParTotal(holes)}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                {backNine.map(hole => (
                  <TableCell key={hole.id} align="center">
                    <Box
                      component="input"
                      type="number"
                      min="1"
                      max="20"
                      value={scores[player.id]?.[hole.holeNumber] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : null;
                        if (value !== null && (value < 1 || value > 20)) return;
                        onScoreChange(player.id, hole.holeNumber, value);
                      }}
                      sx={{
                        width: '40px',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                        padding: '4px',
                        backgroundColor: 'background.paper',
                        color: (scores[player.id]?.[hole.holeNumber] ?? null) !== null
                          ? scores[player.id]?.[hole.holeNumber]! < hole.par
                            ? 'error.main'
                            : scores[player.id]?.[hole.holeNumber] === hole.par
                              ? 'primary.main'
                              : 'text.primary'
                          : 'text.primary',
                        textAlign: 'center',
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
                  </TableCell>
                ))}
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
