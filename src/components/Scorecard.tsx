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
            {[...courseHoles.slice(0, 9).map((hole: GolfHole) => (
              <TableCell key={hole.number} align="center">
                {hole.number}
              </TableCell>
            )), 
            <TableCell key="in" align="center">In</TableCell>,
            ...courseHoles.slice(9).map((hole: GolfHole) => (
              <TableCell key={hole.number} align="center">
                {hole.number}
              </TableCell>
            )),
            <TableCell key="out" align="center">Out</TableCell>]}
            <TableCell align="center">Total</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Par</TableCell>
            {(() => {
              const frontNine = courseHoles.slice(0, 9);
              const backNine = courseHoles.slice(9);
              const frontNinePar = frontNine.reduce((sum, h) => sum + h.par, 0);
              const backNinePar = backNine.reduce((sum, h) => sum + h.par, 0);
              
              return [
                ...frontNine.map((hole: GolfHole) => (
                  <TableCell key={hole.number} align="center">
                    {hole.par}
                  </TableCell>
                )),
                <TableCell key="in" align="center">{frontNinePar}</TableCell>,
                ...backNine.map((hole: GolfHole) => (
                  <TableCell key={hole.number} align="center">
                    {hole.par}
                  </TableCell>
                )),
                <TableCell key="out" align="center">{backNinePar}</TableCell>
              ];
            })()}
            <TableCell align="center">
              {courseHoles.reduce((sum, hole) => sum + hole.par, 0)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>SI</TableCell>
            {[...courseHoles.slice(0, 9).map((hole: GolfHole) => (
              <TableCell key={hole.number} align="center">
                {hole.strokeIndex}
              </TableCell>
            )),
            <TableCell key="in" />,
            ...courseHoles.slice(9).map((hole: GolfHole) => (
              <TableCell key={hole.number} align="center">
                {hole.strokeIndex}
              </TableCell>
            )),
            <TableCell key="out" />]}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map(player => {
            const playerScores = scores[player.id] || {};
            const tee = course?.tees?.find((t: GolfTee) => t.id === player.teeId);
            const total = Object.values(playerScores).reduce((sum, score) => (sum || 0) + (score || 0), 0) || 0;
            
            // Calculate net score by summing all handicap-adjusted scores
            const netScore = courseHoles.reduce((sum, hole) => {
              const score = playerScores[hole.number];
              if (score === undefined || score === null) return sum;
              const strokesGiven = Math.floor(player.handicap / 18) + (player.handicap % 18 >= hole.strokeIndex ? 1 : 0);
              return sum + (score - strokesGiven);
            }, 0);

            const frontNineTotal = Object.entries(playerScores)
              .filter(([hole]) => parseInt(hole) <= 9)
              .reduce((sum, [_, score]) => sum + (score || 0), 0);
            const backNineTotal = Object.entries(playerScores)
              .filter(([hole]) => parseInt(hole) > 9 && parseInt(hole) <= 18)
              .reduce((sum, [_, score]) => sum + (score || 0), 0);

            // Calculate handicap adjustments for front nine
            const frontNineAdjusted = courseHoles.slice(0, 9).reduce((sum, hole) => {
              const score = playerScores[hole.number];
              if (score === undefined || score === null) return sum;
              const strokesGiven = Math.floor(player.handicap / 18) + (player.handicap % 18 >= hole.strokeIndex ? 1 : 0);
              return sum + (score - strokesGiven);
            }, 0);

            // Calculate handicap adjustments for back nine
            const backNineAdjusted = courseHoles.slice(9).reduce((sum, hole) => {
              const score = playerScores[hole.number];
              if (score === undefined || score === null) return sum;
              const strokesGiven = Math.floor(player.handicap / 18) + (player.handicap % 18 >= hole.strokeIndex ? 1 : 0);
              return sum + (score - strokesGiven);
            }, 0);
            
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
                {[...courseHoles.slice(0, 9).map((hole: GolfHole) => {
                  const score = playerScores[hole.number];
                  // Calculate strokes given based on handicap and SI
                  const strokesGiven = Math.floor(player.handicap / 18) + (player.handicap % 18 >= hole.strokeIndex ? 1 : 0);
                  const adjustedScore = score !== undefined && score !== null 
                    ? score - strokesGiven
                    : null;

                  return (
                    <TableCell key={`${hole.number}-${player.id}`} align="center" sx={{ minWidth: '60px' }}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="input"
                          type="number"
                          min="1"
                          max="20"
                          value={score || ''}
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
                            color: score && hole.par
                              ? score < hole.par 
                                ? 'error.main'
                                : score === hole.par 
                                  ? 'primary.main'
                                  : 'text.primary'
                              : 'text.primary',
                            '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                              display: 'none'
                            },
                            appearance: 'textfield'
                          }}
                        />
                        {strokesGiven > 0 && (
                          <Box sx={{ 
                            position: 'absolute',
                            top: -8,
                            right: 0,
                            color: 'warning.main',
                            fontSize: '0.8em'
                          }}>
                            {'*'.repeat(strokesGiven)}
                          </Box>
                        )}
                        {adjustedScore !== null && (
                          <div style={{ fontSize: '0.7em', color: 'text.secondary' }}>
                            {adjustedScore}
                          </div>
                        )}
                      </Box>
                    </TableCell>
                  );
                }),
                <TableCell key={`in-${player.id}`} align="center" sx={{ minWidth: '60px' }}>
                  <Typography variant="body1">{frontNineTotal || ''}</Typography>
                  {frontNineTotal > 0 && (
                    <div style={{ fontSize: '0.7em', color: 'text.secondary' }}>
                      {frontNineAdjusted}
                    </div>
                  )}
                </TableCell>,
                ...courseHoles.slice(9).map((hole: GolfHole) => {
                  const score = playerScores[hole.number];
                  // Calculate strokes given based on handicap and SI
                  const strokesGiven = Math.floor(player.handicap / 18) + (player.handicap % 18 >= hole.strokeIndex ? 1 : 0);
                  const adjustedScore = score !== undefined && score !== null 
                    ? score - strokesGiven
                    : null;

                  return (
                    <TableCell key={`${hole.number}-${player.id}`} align="center" sx={{ minWidth: '60px' }}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="input"
                          type="number"
                          min="1"
                          max="20"
                          value={score || ''}
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
                            color: score && hole.par
                              ? score < hole.par 
                                ? 'error.main'
                                : score === hole.par 
                                  ? 'primary.main'
                                  : 'text.primary'
                              : 'text.primary',
                            '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                              display: 'none'
                            },
                            appearance: 'textfield'
                          }}
                        />
                        {strokesGiven > 0 && (
                          <Box sx={{ 
                            position: 'absolute',
                            top: -8,
                            right: 0,
                            color: 'warning.main',
                            fontSize: '0.8em'
                          }}>
                            {'*'.repeat(strokesGiven)}
                          </Box>
                        )}
                        {adjustedScore !== null && (
                          <div style={{ fontSize: '0.7em', color: 'text.secondary' }}>
                            {adjustedScore}
                          </div>
                        )}
                      </Box>
                    </TableCell>
                  );
                }),
                <TableCell key={`out-${player.id}`} align="center" sx={{ minWidth: '60px' }}>
                  <Typography variant="body1">{backNineTotal || ''}</Typography>
                  {backNineTotal > 0 && (
                    <div style={{ fontSize: '0.7em', color: 'text.secondary' }}>
                      {backNineAdjusted}
                    </div>
                  )}
                </TableCell>]}
                <TableCell align="center" sx={{ minWidth: '60px' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{total || ''}</Typography>
                  {total > 0 && (
                    <div style={{ fontSize: '0.7em', color: 'text.secondary' }}>
                      {netScore}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};
