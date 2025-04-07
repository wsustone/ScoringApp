import { useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid, Card, CardContent, List, ListItem, ListItemText, Tabs, Tab, CircularProgress } from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GOLF_COURSES, GET_ACTIVE_ROUNDS, GET_ROUND } from '../graphql/queries';
import { START_ROUND, END_ROUND, DISCARD_ROUND, UPDATE_SCORE } from '../graphql/mutations';
import { PlayerForm } from '../components/PlayerForm';
import { GameComponent } from '../components/GameComponent';
import { HoleByHole } from '../components/HoleByHole';
import { Scorecard } from '../components/Scorecard';
import { GolfCourse, Game } from '../types/game';
import { PlayerRound } from '../types/player';
import { Round } from '../types/round';
import { RoundResponse } from '../types/round';

interface GetActiveRoundsResponse {
  get_active_rounds: Round[];
}

export const Dashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [players, setPlayers] = useState<PlayerRound[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const { data: coursesData, loading: coursesLoading } = useQuery<{ golf_courses: GolfCourse[] }>(GET_GOLF_COURSES);
  const { data: activeRoundsData, loading: activeRoundsLoading } = useQuery<GetActiveRoundsResponse>(GET_ACTIVE_ROUNDS);
  const { data: roundData, loading: roundLoading } = useQuery<{ get_round: RoundResponse }>(GET_ROUND, {
    variables: { id: selectedRound },
    skip: !selectedRound,
  });

  const [startRound] = useMutation(START_ROUND);
  const [endRound] = useMutation(END_ROUND);
  const [discardRound] = useMutation(DISCARD_ROUND);
  const [updateScore] = useMutation(UPDATE_SCORE);

  const handleCourseSelect = (course: GolfCourse) => {
    setSelectedCourse(course);
    setPlayers([]);
    setSelectedGames([]);
  };

  const handleStartRound = async () => {
    if (!selectedCourse || players.length === 0 || selectedGames.length === 0) return;

    try {
      const { data } = await startRound({
        variables: {
          input: {
            course_id: selectedCourse.id,
            players: players.map(p => ({
              player_id: p.player_id,
              name: p.name,
              handicap: p.handicap,
              tee_id: p.tee_id,
            })),
            games: selectedGames.map(g => ({
              type: g.type,
              enabled: g.enabled,
              settings: g.settings,
            })),
          },
        },
      });

      setSelectedRound(data.startRound.id);
      setActiveTab(1);
    } catch (error) {
      console.error('Error starting round:', error);
    }
  };

  const handleEndRound = async () => {
    if (!selectedRound) return;

    try {
      await endRound({
        variables: {
          input: {
            round_id: selectedRound,
          },
        },
      });

      setSelectedRound(null);
      setActiveTab(0);
    } catch (error) {
      console.error('Error ending round:', error);
    }
  };

  const handleDiscardRound = async (roundId: string) => {
    try {
      await discardRound({
        variables: {
          id: roundId,
        },
      });

      // If we're discarding the currently selected round, reset the UI
      if (selectedRound === roundId) {
        setSelectedRound(null);
        setActiveTab(0);
      }
    } catch (error) {
      console.error('Error discarding round:', error);
    }
  };

  const handleEndCurrentRound = () => handleEndRound();
  const handleDiscardCurrentRound = () => handleDiscardRound(selectedRound!);

  const handleScoreUpdate = async (playerId: string, holeId: string, score: number) => {
    if (!selectedRound) return;

    try {
      await updateScore({
        variables: {
          input: {
            round_id: selectedRound,
            player_id: playerId,
            hole_id: holeId,
            score,
          },
        },
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleScoreChange = (playerId: string, holeNumber: number, score: number | null) => {
    if (!roundData?.get_round) return;
    const hole = roundData.get_round.course.holes.find(h => h.number === holeNumber);
    if (!hole) return;
    handleScoreUpdate(playerId, hole.id, score ?? 0);
  };

  const renderSetupTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Course
      </Typography>
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Course</InputLabel>
        <Select
          value={selectedCourse?.id || ''}
          onChange={(e) => {
            const course = coursesData?.golf_courses.find(c => c.id === e.target.value);
            if (course) handleCourseSelect(course);
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
          <Typography variant="h5" gutterBottom>
            Add Players
          </Typography>
          <Box sx={{ mb: 4 }}>
            <PlayerForm
              players={players}
              onPlayersChange={setPlayers}
              teeSettings={selectedCourse.tee_settings}
            />
          </Box>

          <Typography variant="h5" gutterBottom>
            Select Games
          </Typography>
          <Box sx={{ mb: 4 }}>
            <GameComponent
              selectedGames={selectedGames}
              onGameChange={setSelectedGames}
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
  );

  const renderActiveRoundsTab = () => (
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
  );

  const renderRoundTab = () => {
    if (!roundData?.get_round) return null;

    const round = roundData.get_round;

    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          {round.course_name}
        </Typography>
        <Box sx={{ mb: 4 }}>
          <HoleByHole
            players={round.players}
            onScoreUpdate={handleScoreUpdate}
            scores={round.scores}
            holes={round.course.holes}
            playerTees={round.player_tees}
            games={round.games}
          />
        </Box>
        <Box sx={{ mb: 4 }}>
          <Scorecard
            players={round.players}
            scores={round.scores}
            games={round.games}
            on_score_change={handleScoreChange}
            player_tees={round.player_tees}
            on_end_round={handleEndRound}
            on_discard_round={handleDiscardRound}
          />
        </Box>
        <Box>
          <Button variant="contained" color="primary" onClick={handleEndCurrentRound} sx={{ mr: 2 }}>
            End Round
          </Button>
          <Button variant="outlined" color="error" onClick={handleDiscardCurrentRound} sx={{ mr: 2 }}>
            Discard Round
          </Button>
        </Box>
      </Box>
    );
  };

  if (coursesLoading || activeRoundsLoading || roundLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Golf Scoring
      </Typography>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Setup New Round" />
        <Tab label="Active Rounds" />
        {selectedRound && <Tab label="Current Round" />}
      </Tabs>
      {activeTab === 0 && renderSetupTab()}
      {activeTab === 1 && renderActiveRoundsTab()}
      {activeTab === 2 && renderRoundTab()}
    </Box>
  );
};
