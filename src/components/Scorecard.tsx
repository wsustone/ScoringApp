import { Table, TableBody, TableCell, TableHead, TableRow, Paper, CircularProgress, Box, Alert, Typography } from '@mui/material';
import { Player } from './PlayerForm';
import { GolfHole, GolfTee, GolfCourse } from '../types/game';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSE } from '../graphql/queries';

interface ScorecardProps {
  holes: GolfHole[];
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
  selectedCourseId: string;
}

export const Scorecard = ({ holes, players, scores, onScoreChange, selectedCourseId }: ScorecardProps) => {
  const { loading, error, data } = useQuery<{ golfCourse: GolfCourse }>(GET_GOLF_COURSE, {
    variables: { id: selectedCourseId },
    skip: !selectedCourseId
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading course: {error.message}
      </Alert>
    );
  }

  const course = data?.golfCourse;
  const courseHoles = course?.tees?.[0]?.holes || holes;

  return (
    <Paper sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            {courseHoles.map((hole: GolfHole) => (
              <TableCell key={hole.number} align="center">
                {hole.number}
              </TableCell>
            ))}
            <TableCell align="center">Total</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Par</TableCell>
            {courseHoles.map((hole: GolfHole) => (
              <TableCell key={hole.number} align="center">
                {hole.par}
              </TableCell>
            ))}
            <TableCell align="center">
              {courseHoles.reduce((sum, hole) => sum + hole.par, 0)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>SI</TableCell>
            {courseHoles.map((hole: GolfHole) => (
              <TableCell key={hole.number} align="center">
                {hole.strokeIndex}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map(player => {
            const playerScores = scores[player.id] || {};
            const tee = course?.tees?.find((t: GolfTee) => t.id === player.teeId);
            const total = Object.values(playerScores).reduce((sum, score) => (sum || 0) + (score || 0), 0);
            
            return (
              <TableRow key={player.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1">
                      {player.name || `Player ${player.id}`}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                      {tee && <Typography variant="caption" sx={{ color: 'grey' }}>{tee.name}</Typography>}
                      <Typography variant="caption" sx={{ color: 'grey' }}>HCP: {player.handicap}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                {courseHoles.map((hole: GolfHole) => {
                  const holeDistance = tee?.holes?.find((h: GolfHole) => h.number === hole.number)?.distance;
                  return (
                    <TableCell key={`${hole.number}-${player.id}`} align="center" sx={{ minWidth: '60px' }}>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={playerScores[hole.number] || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value, 10) : null;
                          if (value !== null && (value < 1 || value > 20)) return;
                          onScoreChange(player.id, hole.number, value);
                        }}
                        style={{
                          width: '40px',
                          textAlign: 'center',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '4px',
                          color: playerScores[hole.number] && hole.par
                            ? playerScores[hole.number]! < hole.par 
                              ? '#ff0000' 
                              : playerScores[hole.number] === hole.par 
                                ? '#0000ff'
                                : '#000000'
                            : '#000000'
                        }}
                      />
                      {holeDistance && (
                        <div style={{ fontSize: '0.7em', color: 'grey' }}>{holeDistance}y</div>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  {total}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};
