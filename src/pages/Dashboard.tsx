import React, { useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid, Card, CardContent, List, ListItem, ListItemText, Divider, Tabs, Tab } from '@mui/material';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_GOLF_COURSES, GET_ACTIVE_ROUNDS, GET_ROUND } from '../graphql/queries';
import { START_ROUND, END_ROUND, DISCARD_ROUND } from '../graphql/mutations';
import { PlayerForm, Player } from '../components/PlayerForm';
import { GameComponent } from '../components/GameComponent';
import { HoleByHole } from '../components/HoleByHole';
import { Scorecard } from '../components/Scorecard';
import { GolfCourse, Game, GameType, createGame, Hole, ExtendedGolfTee } from '../types/game';

interface Round {
  id: string;
  course_name: string;
  players: Player[];
  holes: Hole[];
  scores: { [key: string]: { [key: number]: number | null } };
  playerTees: { [key: string]: ExtendedGolfTee };
  games: Game[];
}

interface ApiRound {
  id: string;
  course_name: string;
  players: Array<{
    id: string;
    name: string;
    tee_id: string;
    handicap: number;
  }>;
  holes: Hole[];
  scores: { [key: string]: { [key: number]: number | null } };
  player_tees: { [key: string]: ExtendedGolfTee };
  games: Array<{
    type: string;
    id: string;
    course_id: string;
  }>;
}

export const Dashboard = () => {
  const client = useApolloClient();
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [startRoundMutation] = useMutation(START_ROUND);
  const [endRoundMutation] = useMutation(END_ROUND);
  const [discardRoundMutation] = useMutation(DISCARD_ROUND);
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);

  const { loading: coursesLoading, error: coursesError, data: coursesData } = useQuery(GET_GOLF_COURSES);
  const { loading: activeRoundsLoading, data: activeRoundsData } = useQuery(GET_ACTIVE_ROUNDS, {
    pollInterval: 30000, // Poll every 30 seconds
  });

  const handleCourseSelect = (event: any) => {
    const courseId = event.target.value as string;
    const course = coursesData?.golf_courses.find((c: GolfCourse) => c.id === courseId);
    console.log('Selected course:', course);
    setSelectedCourse(course || null);
    
    // Reset games when course changes
    setSelectedGames([]);
  };

  const handleGameChange = (games: Game[]) => {
    setSelectedGames(games);
  };

  const handleStartRound = async () => {
    if (!selectedCourse || !players.length) return;

    const games = selectedGames.map(game => ({
      type: game.type,
      course_id: selectedCourse.id,
      enabled: true,
      settings: game.settings
    }));

    try {
      const { data } = await startRoundMutation({
        variables: {
          input: {
            course_name: selectedCourse.name,
            players: players.map(p => ({
              id: p.id,
              name: p.name,
              handicap: p.handicap,
              tee_id: p.tee_id
            })),
            games
          }
        }
      });

      if (data?.start_round) {
        const round = data.start_round;
        setActiveRound({
          id: round.id,
          course_name: round.course_name,
          players: round.players,
          holes: round.holes || [],
          scores: round.scores || {},
          playerTees: round.player_tees || {},
          games: round.games || []
        });
      }
    } catch (error) {
      console.error('Error starting round:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleScoreChange = (playerId: string, holeNumber: number, score: number | null) => {
    if (!activeRound) return;
    
    setActiveRound({
      ...activeRound,
      scores: {
        ...activeRound.scores,
        [playerId]: {
          ...activeRound.scores[playerId],
          [holeNumber]: score
        }
      }
    });
  };

  const handleEndRound = async () => {
    if (!activeRound) return;

    try {
      const { data } = await endRoundMutation({
        variables: {
          round_id: activeRound.id
        }
      });

      if (data.end_round) {
        // Refresh active rounds list
        await client.refetchQueries({
          include: ['GetActiveRounds']
        });
        setActiveRound(null);
      }
    } catch (error) {
      console.error('Error ending round:', error);
      // TODO: Show error message to user
    }
  };

  const handleDiscardRound = async () => {
    if (!activeRound) return;

    try {
      const { data } = await discardRoundMutation({
        variables: {
          round_id: activeRound.id
        }
      });

      if (data.discard_round) {
        // Refresh active rounds list
        await client.refetchQueries({
          include: ['GetActiveRounds']
        });
        setActiveRound(null);
      }
    } catch (error) {
      console.error('Error discarding round:', error);
      // TODO: Show error message to user
    }
  };

  const handleSelectActiveRound = async (roundId: string) => {
    try {
      const { data } = await client.query<{ get_round: ApiRound }>({
        query: GET_ROUND,
        variables: { id: roundId }
      });

      if (data?.get_round) {
        const apiRound = data.get_round;
        
        // Transform the data to match our frontend types
        const round: Round = {
          id: apiRound.id,
          course_name: apiRound.course_name,
          players: apiRound.players.map(player => ({
            id: player.id,
            name: player.name,
            tee_id: player.tee_id,
            handicap: player.handicap
          })),
          holes: apiRound.holes,
          scores: apiRound.scores,
          playerTees: apiRound.player_tees,
          games: apiRound.games.map(game => createGame(game.type as GameType, apiRound.id, game.course_id))
        };
        
        setActiveRound(round);
        
        // Find and set the course
        const course = coursesData?.golf_courses.find((c: GolfCourse) => c.name === round.course_name);
        if (course) {
          setSelectedCourse(course);
        }
        
        // Set players
        setPlayers(round.players);
        
        // Set games
        setSelectedGames(round.games);
      }
    } catch (error) {
      console.error('Failed to load round:', error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Golf Scoring Dashboard
      </Typography>

      {!activeRound ? (
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
                      tee_settings={selectedCourse.tee_settings}
                      onPlayersChange={setPlayers}
                      players={players}
                    />
                    <GameComponent
                      selectedGames={selectedGames}
                      onGameChange={handleGameChange}
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
                        <ListItem
                          button
                          onClick={() => handleSelectActiveRound(round.id)}
                        >
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
      ) : (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Scorecard" />
              <Tab label="Hole by Hole" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box>
              <Scorecard
                players={activeRound.players}
                scores={activeRound.scores}
                onScoreChange={handleScoreChange}
                playerTees={activeRound.playerTees}
                onEndRound={handleEndRound}
                onDiscardRound={handleDiscardRound}
              />

              {activeRound.games.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Game Results
                  </Typography>
                  {activeRound.games.map(game => (
                    <Box key={game.id} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        {game.type.charAt(0).toUpperCase() + game.type.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {game.enabled ? 'Active' : 'Inactive'}
                      </Typography>
                      {/* Game-specific results will be implemented here */}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <HoleByHole
              players={activeRound.players}
              scores={activeRound.scores}
              onScoreChange={handleScoreChange}
              playerTees={activeRound.playerTees}
              holes={activeRound.holes}
              games={activeRound.games}
            />
          )}
        </Box>
      )}
    </Box>
  );
};
