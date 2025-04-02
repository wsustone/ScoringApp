import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid, Card, CardContent, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GOLF_COURSES, GET_ACTIVE_ROUNDS } from '../graphql/queries';
import { START_ROUND } from '../graphql/mutations';
import { PlayerForm, Player } from '../components/PlayerForm';
import { GameComponent } from '../components/Game';
import { GolfCourse, Game, GameType, createGame } from '../types/game';
import { useState } from 'react';

export const Dashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [startRoundMutation] = useMutation(START_ROUND);

  const { loading: coursesLoading, error: coursesError, data: coursesData } = useQuery(GET_GOLF_COURSES);
  const { loading: activeRoundsLoading, data: activeRoundsData } = useQuery(GET_ACTIVE_ROUNDS, {
    pollInterval: 30000, // Poll every 30 seconds
  });

  const handleCourseSelect = (event: any) => {
    const courseId = event.target.value as string;
    const course = coursesData?.golf_courses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
  };

  const handleGameChange = (gameTypes: GameType[]) => {
    if (!selectedCourse) return;
    const games = gameTypes.map(type => createGame(type, selectedCourse.id));
    setSelectedGames(games);
  };

  const handleStartRound = async () => {
    if (!selectedCourse || !players.length) return;

    try {
      const { data } = await startRoundMutation({
        variables: {
          course_name: selectedCourse.name,
          players: players.map(player => ({
            id: player.id,
            name: player.name,
            tee_id: player.teeId,
            handicap: parseInt(player.handicap.toString(), 10),
          })),
        },
      });

      if (data?.start_round) {
        console.log('Round started:', data.start_round);
        setPlayers([]); // Clear players after successful start
        setSelectedGames([]); // Clear selected games
      }
    } catch (error) {
      console.error('Failed to start round:', error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Golf Scoring Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Start New Round
              </Typography>

              {coursesLoading ? (
                <Typography>Loading courses...</Typography>
              ) : coursesError ? (
                <Typography color="error">Error loading courses!</Typography>
              ) : (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Course</InputLabel>
                  <Select
                    value={selectedCourse?.id || ''}
                    onChange={handleCourseSelect}
                    label="Select Course"
                  >
                    {coursesData?.golf_courses?.map((course: GolfCourse) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {selectedCourse && (
                <>
                  <PlayerForm
                    tees={selectedCourse.tees}
                    onPlayersChange={setPlayers}
                    players={players}
                  />
                  <GameComponent
                    onGameChange={handleGameChange}
                    selectedGames={selectedGames}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStartRound}
                    disabled={!players.length}
                    sx={{ mt: 2 }}
                  >
                    Start Round
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Rounds
              </Typography>
              {activeRoundsLoading ? (
                <Typography>Loading active rounds...</Typography>
              ) : activeRoundsData?.get_active_rounds?.length ? (
                <List>
                  {activeRoundsData.get_active_rounds.map((round: any) => (
                    <div key={round.id}>
                      <ListItem>
                        <ListItemText
                          primary={round.course_name}
                          secondary={`Players: ${round.players.length}`}
                        />
                      </ListItem>
                      <Divider />
                    </div>
                  ))}
                </List>
              ) : (
                <Typography>No active rounds</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
