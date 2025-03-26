import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import { Player } from './PlayerForm';
import { GolfHole } from '../types';

interface ScorecardProps {
  holes: GolfHole[];
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
}

export const Scorecard = ({ holes, players, scores, onScoreChange }: ScorecardProps) => {
  return (
    <Paper sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Hole</TableCell>
            <TableCell>Par</TableCell>
            <TableCell>SI</TableCell>
            {players.map(player => (
              <TableCell key={player.id}>{player.name || `Player ${player.id}`}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {holes.map(hole => (
            <TableRow key={hole.number}>
              <TableCell>{hole.number}</TableCell>
              <TableCell>{hole.par}</TableCell>
              <TableCell>{hole.strokeIndex}</TableCell>
              {players.map(player => (
                <TableCell key={`${hole.number}-${player.id}`}>
                  <input
                    type="number"
                    value={scores[player.id]?.[hole.number] || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value, 10) : null;
                      onScoreChange(player.id, hole.number, value);
                    }}
                    style={{ width: '40px' }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            {players.map(player => {
              const playerScores = scores[player.id] || {};
              const total = Object.values(playerScores).reduce((sum, score) => (sum || 0) + (score || 0), 0);
              return (
                <TableCell key={`total-${player.id}`}>
                  {total}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};
