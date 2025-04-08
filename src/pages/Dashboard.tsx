import { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid, Card, CardContent, List, ListItem, ListItemText, Tabs, Tab, CircularProgress } from '@mui/material';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { GET_GOLF_COURSES, GET_ACTIVE_ROUNDS, GET_ROUND_SUMMARY, GET_ROUND_PLAYERS, GET_ROUND_SCORES, GET_ROUND_GAMES, GET_PLAYER_HOLES } from '../graphql/queries';
import { START_ROUND, END_ROUND, DISCARD_ROUND, UPDATE_SCORE } from '../graphql/mutations';
import { PlayerForm } from '../components/PlayerForm';
import { GameComponent } from '../components/GameComponent';
import { HoleByHole } from '../components/HoleByHole';
import { Scorecard } from '../components/Scorecard';
import { GolfCourse, Hole } from '../types/game';
import { PlayerRound, PlayerRoundBasic } from '../types/player';
import { Game } from '../types/game';

interface GetActiveRoundsResponse {
  get_active_rounds: {
    id: string;
    course_name: string;
    status: string;
    start_time: string;
    end_time: string | null;
    players: PlayerRoundBasic[];
  }[];
}

export const Dashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [players, setPlayers] = useState<PlayerRound[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const client = useApolloClient();

  const { data: coursesData, loading: coursesLoading } = useQuery<{ golf_courses: GolfCourse[] }>(GET_GOLF_COURSES);
  const { data: activeRoundsData, loading: activeRoundsLoading } = useQuery<GetActiveRoundsResponse>(GET_ACTIVE_ROUNDS);
  
  const { data: roundInfo, loading: roundInfoLoading } = useQuery(GET_ROUND_SUMMARY, {
    variables: { id: selectedRound },
    skip: !selectedRound,
  });

  const { data: roundPlayers, loading: playersLoading } = useQuery(GET_ROUND_PLAYERS, {
    variables: { id: selectedRound },
    skip: !selectedRound,
  });

  const { data: roundScores, loading: scoresLoading } = useQuery(GET_ROUND_SCORES, {
    variables: { id: selectedRound },
    skip: !selectedRound,
  });

  const { data: roundGames, loading: gamesLoading } = useQuery(GET_ROUND_GAMES, {
    variables: { id: selectedRound },
    skip: !selectedRound,
  });

  // Fetch holes for each player when players are loaded
  useEffect(() => {
    if (roundPlayers?.get_round?.players) {
      roundPlayers.get_round.players.forEach((player: PlayerRound) => {
        client.query({
          query: GET_PLAYER_HOLES,
          variables: { tee_id: player.tee_id }
        });
      });
    }
  }, [roundPlayers, client]);

  const isRoundDataLoading = roundInfoLoading || playersLoading || scoresLoading || gamesLoading;
  const roundData = roundInfo?.get_round && roundPlayers?.get_round && roundScores?.get_round && roundGames?.get_round
    ? {
        get_round: {
          ...roundInfo.get_round,
          players: roundPlayers.get_round.players,
          scores: roundScores.get_round.scores,
          games: roundGames.get_round.games
        }
      }
    : null;

  const [startRound] = useMutation(START_ROUND);
  const [endRound] = useMutation(END_ROUND);
  const [discardRound] = useMutation(DISCARD_ROUND);
  const [updateScore] = useMutation(UPDATE_SCORE);

  const handleStartRound = async () => {
    if (!selectedCourse || players.length === 0 || selectedGames.length === 0) return;

    try {
      const result = await startRound({
        variables: {
          input: {
            course_name: selectedCourse.name,
            players: players.map(p => ({
              id: p.id || uuidv4(),
              name: p.name,
              handicap: p.handicap,
              tee_id: p.tee_id
            })),
            games: selectedGames.map(g => ({
              type: g.type,
              course_id: selectedCourse.id,
              enabled: g.enabled,
              settings: g.settings
            }))
          }
        }
      });

      if (result.data?.start_round) {
        // Refetch the round data to get all details
        await client.query({
          query: GET_ROUND_SUMMARY,
          variables: { id: result.data.start_round.id },
          fetchPolicy: 'network-only'
        });
        setSelectedRound(result.data.start_round.id);
        setActiveTab(2);
      }
    } catch (error) {
      console.error('Error starting round:', error);
    }
  };

  const handleEndRound = async () => {
    if (!selectedRound) return;

    try {
      await endRound({
        variables: { id: selectedRound }
      });
      setSelectedRound(null);
      setActiveTab(0);
    } catch (error) {
      console.error('Error ending round:', error);
    }
  };

  const handleDiscardRound = async (roundId: string) => {
    try {
      await discardRound({ variables: { id: roundId } });
      if (roundId === selectedRound) {
        setSelectedRound(null);
        setActiveTab(0);
      }
    } catch (error) {
      console.error('Error discarding round:', error);
    }
  };

  const handleScoreUpdate = async (player_id: string, hole_number: number, score: number | null) => {
    if (!selectedRound || !roundData?.get_round) return;

    const hole = roundData.get_round.players[0].holes.find((h: Hole) => h.number === hole_number);
    if (!hole) return;

    try {
      await updateScore({
        variables: {
          input: {
            round_id: selectedRound,
            player_id,
            hole_id: hole.id,
            score: score || 0
          }
        }
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  if (coursesLoading || activeRoundsLoading || (selectedRound && isRoundDataLoading)) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Golf Scoring
      </Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Start New Round" />
        <Tab label="Active Rounds" />
        {selectedRound && <Tab label="Current Round" />}
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Select Course
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Course</InputLabel>
            <Select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = coursesData?.golf_courses.find(c => c.id === e.target.value);
                setSelectedCourse(course || null);
              }}
            >
              {coursesData?.golf_courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCourse && (
            <>
              <Box sx={{ mb: 2 }}>
                <PlayerForm
                  players={players}
                  onPlayersChange={setPlayers}
                  teeSettings={selectedCourse.tee_settings}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <GameComponent
                  selectedGames={selectedGames}
                  onGameChange={setSelectedGames}
                  courseId={selectedCourse.id}
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleStartRound}
                disabled={players.length === 0 || selectedGames.length === 0}
              >
                Start Round
              </Button>
            </>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Active Rounds
          </Typography>
          <Grid container spacing={2}>
            {activeRoundsData?.get_active_rounds.map((round) => (
              <Grid item xs={12} sm={6} md={4} key={round.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {round.course_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Started: {new Date(round.start_time).toLocaleString()}
                    </Typography>
                    <List>
                      {round.players.map((player) => (
                        <ListItem key={player.id}>
                          <ListItemText primary={player.name} secondary={`HCP: ${player.handicap}`} />
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          setSelectedRound(round.id);
                          setActiveTab(2);
                        }}
                      >
                        View Round
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => handleDiscardRound(round.id)}
                      >
                        Discard
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeTab === 2 && roundData?.get_round && (
        <Box>
          <Typography variant="h5" gutterBottom>
            {roundData.get_round.course_name}
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <HoleByHole
              players={roundData.get_round.players}
              scores={roundData.get_round.scores}
              holes={roundData.get_round.players[0].holes}
              onScoreUpdate={(playerId, holeId, score) => {
                const holeNumber = roundData.get_round.players[0].holes.find((h: Hole) => h.id === holeId)?.number;
                if (holeNumber) {
                  handleScoreUpdate(playerId, holeNumber, score);
                }
              }}
              games={roundData.get_round.games}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Scorecard
              players={roundData.get_round.players}
              scores={roundData.get_round.scores}
              on_score_change={handleScoreUpdate}
              on_end_round={() => handleEndRound(selectedRound)}
              on_discard_round={() => handleDiscardRound(selectedRound)}
              loading={isRoundDataLoading}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={() => handleEndRound(selectedRound)}>
              End Round
            </Button>
            <Button variant="outlined" color="error" onClick={() => handleDiscardRound(selectedRound)}>
              Discard Round
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
