import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  Select, 
  MenuItem, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Checkbox
} from '@mui/material';
import { Player } from './PlayerForm';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSE } from '../graphql/queries';

interface BankerGameProps {
  players: Player[];
  courseId: string;
  scores: { [key: string]: { [key: number]: number | null } };
  holes: { number: number; par: number }[];
  holeSetups: { [key: number]: HoleSetup };
  onHoleSetupChange: (holeNumber: number, setup: Partial<HoleSetup>) => void;
}

interface HoleSetup {
  banker: string | null;
  dots: number;
  doubles: { [playerId: string]: boolean };
}

export const BankerGame: React.FC<BankerGameProps> = ({ 
  players, 
  courseId,
  scores,
  holes,
  holeSetups,
  onHoleSetupChange
}) => {
  const { loading, error, data } = useQuery(GET_GOLF_COURSE, {
    variables: { id: courseId }
  });

  if (loading) return <Typography>Loading course data...</Typography>;
  if (error) return <Typography color="error">Error loading course: {error.message}</Typography>;

  const course = data.golfCourse;
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {course.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {course.location}
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {players.map((player) => {
          const tee = course.tees.find((t: any) => t.id === player.teeId);
          return (
            <Grid item xs={12} sm={6} md={3} key={player.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{player.name}</Typography>
                <Typography>Handicap: {player.handicap}</Typography>
                <Typography>Tee: {tee?.name} ({tee?.gender})</Typography>
                <Typography>Course Rating: {tee?.courseRating}</Typography>
                <Typography>Slope Rating: {tee?.slopeRating}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Banker Game Setup
      </Typography>
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Hole</TableCell>
              <TableCell>Par</TableCell>
              <TableCell>Banker</TableCell>
              <TableCell>Dots</TableCell>
              <TableCell align="center">Doubles</TableCell>
              <TableCell>Results</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holes.map((hole) => {
              const setup = holeSetups[hole.number] || { banker: null, dots: 1, doubles: {} };
              return (
                <TableRow key={hole.number}>
                  <TableCell>{hole.number}</TableCell>
                  <TableCell>{hole.par}</TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={setup.banker || ''}
                        onChange={(e) => onHoleSetupChange(hole.number, { banker: e.target.value || null })}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {players.map((player) => (
                          <MenuItem key={player.id} value={player.id}>
                            {player.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={setup.dots}
                      onChange={(e) => onHoleSetupChange(hole.number, { dots: parseInt(e.target.value) || 1 })}
                      inputProps={{ min: 1, max: 5 }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      {players.map((player) => (
                        <Box key={player.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Checkbox
                            checked={!!setup.doubles[player.id]}
                            onChange={(e) => {
                              const newDoubles = { ...setup.doubles };
                              if (e.target.checked) {
                                newDoubles[player.id] = true;
                              } else {
                                delete newDoubles[player.id];
                              }
                              onHoleSetupChange(hole.number, { doubles: newDoubles });
                            }}
                            disabled={setup.banker === player.id}
                          />
                          <Typography variant="caption">{player.name}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {setup.banker && scores[setup.banker] && scores[setup.banker][hole.number] !== null ? (
                      <Typography>
                        {Object.entries(scores)
                          .filter(([playerId]) => playerId !== setup.banker)
                          .map(([playerId, playerScores]) => {
                            if (playerScores[hole.number] === null) return null;
                            const diff = playerScores[hole.number]! - scores[setup.banker!][hole.number]!;
                            let points = setup.dots;
                            if (setup.doubles[playerId]) points *= 2;
                            if (diff > 0) {
                              return `${players.find(p => p.id === playerId)?.name}: +${points}`;
                            } else if (diff < 0) {
                              return `${players.find(p => p.id === playerId)?.name}: -${points}`;
                            }
                            return `${players.find(p => p.id === playerId)?.name}: 0`;
                          })
                          .filter(Boolean)
                          .join(', ')}
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
