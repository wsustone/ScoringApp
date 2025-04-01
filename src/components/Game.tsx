import { Box, Grid, Button, TextField, Typography } from '@mui/material';
import { Player } from './PlayerForm';
import { Scorecard } from './Scorecard';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSE } from '../graphql/queries';

interface GolfHole {
  id: string;
  holeNumber: number;
  par: number;
  scoringIndex: number;
}

interface GolfTee {
  id: string;
  name: string;
  gender: string;
  courseRating: number;
  slopeRating: number;
  holes: GolfHole[];
}

interface GameProps {
  players: Player[];
  courseId: string;
  currentHole: number;
  onCurrentHoleChange: (hole: number) => void;
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
}

export const Game = ({
  players,
  courseId,
  currentHole,
  onCurrentHoleChange,
  scores,
  onScoreChange,
}: GameProps) => {
  const { loading, error, data } = useQuery(GET_GOLF_COURSE, {
    variables: { id: courseId },
  });

  if (loading) {
    return <Typography>Loading course details...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading course details: {error.message}</Typography>;
  }

  const course = data?.golfCourse;
  if (!course) {
    return <Typography>No course data available</Typography>;
  }

  const getPlayerTee = (playerId: string): GolfTee | undefined => {
    const player = players.find((p: Player) => p.id === playerId);
    if (!player) return undefined;
    return course.tees.find((t: GolfTee) => t.id === player.teeId);
  };

  const playerTees: { [key: string]: GolfTee } = {};
  players.forEach(player => {
    const tee = getPlayerTee(player.id);
    if (tee) playerTees[player.id] = tee;
  });

  const getPlayerHole = (playerId: string, holeNumber: number): GolfHole | undefined => {
    const tee = playerTees[playerId];
    return tee?.holes.find((h: GolfHole) => h.holeNumber === holeNumber);
  };

  const handleScoreChange = (playerId: string, value: string) => {
    const score = value ? parseInt(value, 10) : null;
    if (score !== null && (score < 1 || score > 20)) return;
    onScoreChange(playerId, currentHole, score);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            {players.map(player => {
              const hole = getPlayerHole(player.id, currentHole);
              const tee = playerTees[player.id];
              if (!hole || !tee) return null;

              return (
                <Box key={player.id}>
                  <Typography variant="h6">
                    {player.name} - Hole {currentHole}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Par {hole.par} - SI: {hole.scoringIndex}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {tee.name} ({tee.gender}) - CR: {tee.courseRating}, SR: {tee.slopeRating}
                  </Typography>
                </Box>
              );
            })}
            <Box>
              <Button onClick={() => onCurrentHoleChange(currentHole - 1)} disabled={currentHole === 1}>
                Previous
              </Button>
              <Button onClick={() => onCurrentHoleChange(currentHole + 1)} disabled={currentHole === 18}>
                Next
              </Button>
            </Box>
          </Box>
        </Grid>

        {players.map((player) => {
          const hole = getPlayerHole(player.id, currentHole);
          if (!hole) return null;

          return (
            <Grid item xs={12} sm={6} md={4} key={player.id}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: 'background.paper',
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {player.name}
                </Typography>
                <TextField
                  type="number"
                  label="Score"
                  value={scores[player.id]?.[currentHole] ?? ''}
                  onChange={(e) => handleScoreChange(player.id, e.target.value)}
                  inputProps={{
                    min: 1,
                    max: 20,
                  }}
                  fullWidth
                  size="small"
                />
              </Box>
            </Grid>
          );
        })}

        <Grid item xs={12}>
          <Scorecard
            players={players}
            scores={scores}
            onScoreChange={onScoreChange}
            playerTees={playerTees}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
