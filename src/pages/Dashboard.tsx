import { useState } from 'react';
import { Box, Tab, Tabs, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@apollo/client';
import { CourseList } from '../components/CourseList';
import { GamePage } from './GamePage';
import { TabPanel } from '../components/TabPanel';
import { Scorecard } from '../components/Scorecard';
import { GolfCourse, ExtendedGolfTee, GameType, BankerGame, NassauGame, SkinsGame, GolfTee, GolfHole, Hole, MatchData } from '../types/game';
import { Player } from '../components/PlayerForm';
import { GET_GOLF_COURSES } from '../graphql/queries';

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

interface GolfCoursesData {
  golfCourses: GolfCourse[];
}

export const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [playerTees, setPlayerTees] = useState<{ [key: string]: ExtendedGolfTee }>({});

  const { loading, error, data } = useQuery<GolfCoursesData>(GET_GOLF_COURSES);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCourseSelect = (courseId: string) => {
    const course = data?.golfCourses?.find((c: GolfCourse) => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      // Reset game-related state when course changes
      setPlayers([]);
      setSelectedGames([]);
      setScores({});
      setPlayerTees({});
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
  const canSelectPlayers = selectedCourse !== null;
  const canViewScorecard = canSelectPlayers && players.length > 0;

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
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Course Selection" />
          <Tab label="Players & Games" disabled={!canSelectPlayers} />
          <Tab label="Scorecard" disabled={!canViewScorecard} />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : (
          <CourseList 
            courses={data?.golfCourses || []}
            selectedCourseId={selectedCourse?.id || null}
            onCourseSelect={handleCourseSelect}
          />
        )}
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
    </Box>
  );
};
