import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GOLF_COURSES, GET_ACTIVE_ROUNDS } from '../graphql/queries';
import { START_ROUND } from '../graphql/mutations';
import { useNavigate } from 'react-router-dom';

export interface Player {
  id: string;
  name: string;
  handicap: number;
  teeId: string;
}

interface ActiveRoundPlayer {
  playerName: string;
  handicap: number;
}

interface ActiveRound {
  id: string;
  courseName: string;
  startTime: string;
  players: ActiveRoundPlayer[];
}

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  tees: {
    id: string;
    name: string;
    gender: string;
    courseRating: number;
    slopeRating: number;
  }[];
}

interface PlayerFormProps {
  players?: Player[];
  onPlayersChange: (players: Player[]) => void;
  selectedCourseId?: string;
  onCourseChange: (courseId: string) => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({
  players = [],
  onPlayersChange,
  selectedCourseId = '',
  onCourseChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { loading: coursesLoading, error: courseError, data } = useQuery(GET_GOLF_COURSES);
  const { loading: roundsLoading, error: roundsError, data: roundsData } = useQuery(GET_ACTIVE_ROUNDS);

  const [startRound] = useMutation(START_ROUND, {
    onCompleted: (data) => {
      const roundId = data.startRound;
      navigate(`/round/${roundId}`);
    },
    onError: (error) => {
      setError(error.message);
    },
    refetchQueries: ['GetActiveRounds']
  });

  const handleStartRound = async () => {
    if (!selectedCourseId) {
      setError('Please select a course');
      return;
    }

    if (players.length === 0) {
      setError('Please add at least one player');
      return;
    }

    const selectedCourse = data?.golfCourses?.find((course: GolfCourse) => course.id === selectedCourseId);
    if (!selectedCourse) {
      setError('Selected course not found');
      return;
    }

    // Create default holes array for 18 holes
    const holes = Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4 // Default par, adjust if you have actual hole data
    }));

    // Default game options
    const gameOptions = {
      minDots: 1,
      maxDots: 4,
      dotValue: 0.25,
      doubleBirdieBets: true,
      useGrossBirdies: false,
      par3Triples: true
    };

    const playerData = players.map(player => ({
      id: player.id,
      name: player.name,
      handicap: player.handicap,
      teeId: player.teeId
    }));

    try {
      await startRound({
        variables: {
          courseName: selectedCourse.name,
          players: playerData,
          holes: holes,
          gameOptions: gameOptions
        }
      });
    } catch (error) {
      // Error is handled in onError callback
    }
  };

  if (coursesLoading || roundsLoading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (courseError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading courses: {courseError.message}
      </Alert>
    );
  }

  if (roundsError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading active rounds: {roundsError.message}
      </Alert>
    );
  }

  const courses = data?.golfCourses || [];
  const rounds = roundsData?.getActiveRounds || [];

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Golf Scoring Dashboard
          </Typography>
        </Grid>
        
        {/* Active Rounds Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h5" gutterBottom>Active Rounds</Typography>
            {rounds.length === 0 ? (
              <Typography>No active rounds found.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>Players</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rounds.map((round: ActiveRound) => (
                      <TableRow key={round.id}>
                        <TableCell>{round.courseName}</TableCell>
                        <TableCell>
                          {new Date(round.startTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {round.players.map(p => `${p.playerName} (${p.handicap})`).join(', ')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/round/${round.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* New Round Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h5" gutterBottom>Start New Round</Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Course</InputLabel>
              <Select
                value={selectedCourseId}
                onChange={(e) => onCourseChange(e.target.value)}
                label="Select Course"
              >
                {courses.map((course: GolfCourse) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCourseId && (
              <>
                <Typography variant="h6" gutterBottom>
                  Players
                </Typography>
                <List>
                  {players.map((player, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => navigate(`/edit-player/${selectedCourseId}/${player.id}`)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => {
                              const newPlayers = [...players];
                              newPlayers.splice(index, 1);
                              onPlayersChange(newPlayers);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={`${player.name} (Handicap: ${player.handicap})`}
                        secondary={`Tee: ${courses.find((c: GolfCourse) => c.id === selectedCourseId)?.tees.find((t: GolfCourse['tees'][0]) => t.id === player.teeId)?.name || 'Not selected'}`}
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/add-player/${selectedCourseId}`)}
                  sx={{ mt: 2, mr: 1 }}
                >
                  Add Player
                </Button>

                {players.length > 0 && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleStartRound}
                    sx={{ mt: 2 }}
                  >
                    Start Round
                  </Button>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
