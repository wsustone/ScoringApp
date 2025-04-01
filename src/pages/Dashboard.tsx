import { useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GamePage } from './GamePage';
import { TabPanel } from '../components/TabPanel';
import { Scorecard } from '../components/Scorecard';
import { HoleByHole } from '../components/HoleByHole';
import { GolfCourse, ExtendedGolfTee, GameType, BankerGame, NassauGame, SkinsGame, GolfTee, GolfHole, Hole, MatchData, BankerHoleData } from '../types/game';
import { Player } from '../components/PlayerForm';
import { GET_GOLF_COURSES, GET_ACTIVE_ROUNDS } from '../graphql/queries';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface ActiveRound {
  id: string;
  startTime: string;
  endTime: string | null;
  courseName: string;
  status: string;
  players: Array<{
    id: string;
    roundId: string;
    playerId: string;
    name: string;
    handicap: number;
    teeId: string;
  }>;
  scores: Array<{
    id: string;
    roundId: string;
    holeId: string;
    playerId: string;
    score: number;
    timestamp: string;
  }>;
}

interface GolfCoursesData {
  golfCourses: GolfCourse[];
}

export const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [playerTees] = useState<{ [key: string]: ExtendedGolfTee }>({});

  const { loading, error, data } = useQuery<GolfCoursesData>(GET_GOLF_COURSES);
  const {
    loading: activeRoundsLoading,
    error: activeRoundsError,
    data: activeRoundsData,
  } = useQuery(GET_ACTIVE_ROUNDS, {
    skip: !selectedCourse,
    pollInterval: 30000, // Poll every 30 seconds
  });

  const transformTee = (tee: GolfTee): ExtendedGolfTee => ({
    id: tee.id,
    name: tee.name,
    courseRating: tee.courseRating,
    slopeRating: tee.slopeRating,
    holes: tee.holes.map((hole: GolfHole) => ({
      id: hole.id,
      roundId: 'default',
      number: hole.holeNumber,
      par: hole.par,
      distance: 0, // Default to 0 until backend supports distance
      strokeIndex: hole.scoringIndex
    }))
  });

  const createEmptyMatchData = (): MatchData => ({
    winner: null,
    points: 0
  });

  const createBankerGame = (courseId: string): BankerGame => ({
    id: `banker-${courseId}`,
    type: 'banker',
    roundId: courseId,
    minDots: 1,
    maxDots: 4,
    dotValue: 1,
    doubleBirdieBets: true,
    useGrossBirdies: false,
    par3Triples: false,
    bankerData: {
      holes: []
    }
  });

  const createNassauGame = (courseId: string): NassauGame => ({
    id: `nassau-${courseId}`,
    type: 'nassau',
    roundId: courseId,
    nassauData: {
      frontNine: createEmptyMatchData(),
      backNine: createEmptyMatchData(),
      match: createEmptyMatchData()
    }
  });

  const createSkinsGame = (courseId: string): SkinsGame => ({
    id: `skins-${courseId}`,
    type: 'skins',
    roundId: courseId,
    skinsData: {
      holes: []
    }
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCourseSelect = (event: SelectChangeEvent<string>) => {
    const courseId = event.target.value;
    const course = data?.golfCourses.find((c: GolfCourse) => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
    }
  };

  const handleScoreChange = (playerId: string, holeNumber: number, score: number | null) => {
    setScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [holeNumber]: score,
      },
    }));
  };

  const createGameFromType = (type: GameType) => {
    if (!selectedCourse) throw new Error('No course selected');
    
    switch (type) {
      case 'banker':
        return createBankerGame(selectedCourse.id);
      case 'nassau':
        return createNassauGame(selectedCourse.id);
      case 'skins':
        return createSkinsGame(selectedCourse.id);
    }
  };

  // Determine if tabs should be enabled
  const canSelectPlayers = Boolean(selectedCourse);
  const canViewScorecard = Boolean(selectedCourse);

  const getHoles = (): Hole[] => {
    if (!selectedCourse) return [];
    return selectedCourse.tees[0].holes.map(hole => ({
      id: hole.id,
      roundId: selectedCourse.id,
      number: hole.holeNumber,
      par: hole.par,
      distance: 0,
      strokeIndex: hole.scoringIndex
    }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Starting Page" />
          <Tab label="Players & Games" disabled={!canSelectPlayers} />
          <Tab label="Scorecard" disabled={!canViewScorecard} />
          <Tab label="Hole by Hole" disabled={!canViewScorecard} />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        <Typography variant="h4" gutterBottom>
          Welcome to Golf Scoring App
        </Typography>
        <Typography variant="body1" paragraph>
          Select a course to start a new round or continue an existing one.
        </Typography>

        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="course-select-label">Select Course</InputLabel>
            <Select
              labelId="course-select-label"
              id="course-select"
              value={selectedCourse?.id || ''}
              onChange={handleCourseSelect}
              label="Select Course"
              disabled={loading}
            >
              {loading ? (
                <MenuItem disabled>Loading courses...</MenuItem>
              ) : error ? (
                <MenuItem disabled>Error loading courses</MenuItem>
              ) : (
                data?.golfCourses.map((course: GolfCourse) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name} - {course.location} ({course.tees.length} tees)
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {selectedCourse && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Active Rounds
              </Typography>
              {activeRoundsLoading ? (
                <Typography>Loading active rounds...</Typography>
              ) : activeRoundsError ? (
                <Typography color="error">Error loading active rounds</Typography>
              ) : activeRoundsData?.getActiveRounds?.length > 0 ? (
                <List>
                  {activeRoundsData.getActiveRounds.map((round: ActiveRound) => (
                    <ListItem
                      key={round.id}
                      divider
                      sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={`Round started ${new Date(round.startTime).toLocaleString()}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              Players: {round.players.map((p) => p.name).join(', ')}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2">
                              Status: {round.status}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => setSelectedTab(1)}
                          color="primary"
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">
                  No active rounds for this course
                </Typography>
              )}

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => setSelectedTab(1)}
                >
                  Continue to Players & Games
                </Button>
              </Box>
            </>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {selectedCourse && (
          <GamePage
            availableTees={selectedCourse.tees.map(transformTee)}
            onPlayersChange={setPlayers}
            onGamesChange={setSelectedGames}
          />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {selectedCourse && players.length > 0 && (
          <Scorecard
            players={players}
            holes={getHoles()}
            scores={scores}
            onScoreChange={handleScoreChange}
            playerTees={playerTees}
            games={selectedGames.map(createGameFromType)}
          />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        {selectedCourse && players.length > 0 && (
          <HoleByHole
            players={players}
            holes={getHoles()}
            scores={scores}
            onScoreChange={handleScoreChange}
            games={selectedGames.map(createGameFromType)}
            onBankerUpdate={(holeNumber: number, data: Partial<BankerHoleData>) => {
              const updatedGames = selectedGames.map(gameType => {
                const game = createGameFromType(gameType);
                if (game.type !== 'banker') return gameType;
                
                const bankerGame = game as BankerGame;
                const existingHoleIndex = bankerGame.bankerData.holes.findIndex(
                  (h: BankerHoleData) => h.holeNumber === holeNumber
                );
                
                if (existingHoleIndex >= 0) {
                  bankerGame.bankerData.holes[existingHoleIndex] = {
                    ...bankerGame.bankerData.holes[existingHoleIndex],
                    ...data,
                    doubles: data.doubles || bankerGame.bankerData.holes[existingHoleIndex].doubles
                  };
                } else {
                  bankerGame.bankerData.holes.push({
                    holeNumber,
                    winner: data.winner || null,
                    points: data.points || 0,
                    dots: data.dots || 0,
                    doubles: data.doubles || []
                  });
                }
                
                return gameType;
              });
              
              setSelectedGames(updatedGames);
            }}
          />
        )}
      </TabPanel>
    </Box>
  );
};
