import { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography, Paper } from '@mui/material';
import { CourseList } from '../components/CourseList';
import { PlayerForm } from '../components/PlayerForm';
import { Game } from '../components/Game';
import { HoleByHole } from '../components/HoleByHole';
import { Player } from '../components/PlayerForm';
import { Scorecard } from '../components/Scorecard';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSE } from '../graphql/queries';
import { GolfTee, Hole, GameType, BankerHoleData } from '../types/game';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface HoleWithIndex extends Omit<Hole, 'roundId'> {
  scoringIndex: number;
}

interface ExtendedGolfTee extends Omit<GolfTee, 'holes'> {
  holes: HoleWithIndex[];
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const Dashboard = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);
  const [bankerHoleData, setBankerHoleData] = useState<BankerHoleData | null>(null);

  const { data: courseData } = useQuery(GET_GOLF_COURSE, {
    variables: { id: selectedCourseId },
    skip: !selectedCourseId,
  });

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    // Reset game state when changing courses
    setPlayers([]);
    setScores({});
    setCurrentHole(1);
    setSelectedGames([]);
    setBankerHoleData(null);
    setCurrentTab(1); // Switch to Players tab after course selection
  };

  const handleAddPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleGameChange = (games: GameType[]) => {
    setSelectedGames(games);
    if (!games.includes('banker')) {
      setBankerHoleData(null);
    }
  };

  const handleBankerDataChange = (data: BankerHoleData) => {
    setBankerHoleData(data);
  };

  const isTabDisabled = (tabIndex: number) => {
    if (tabIndex === 0) return false; // Course selection is always enabled
    if (!selectedCourseId) return true; // Other tabs need a course selected
    if (tabIndex === 1) return false; // Players tab is enabled if course is selected
    return players.length === 0; // Other tabs need players
  };

  const getPlayerTees = (): { [key: string]: ExtendedGolfTee } => {
    if (!courseData?.golfCourse) return {};

    return Object.fromEntries(
      players.map(player => [
        player.id,
        {
          ...courseData.golfCourse.tees.find((t: { id: string }) => t.id === player.teeId)!,
          holes: courseData.golfCourse.tees
            .find((t: { id: string }) => t.id === player.teeId)!
            .holes.map((h: { id: string; holeNumber: number; par: number; scoringIndex: number }) => ({
              id: h.id,
              holeNumber: h.holeNumber,
              par: h.par,
              scoringIndex: h.scoringIndex,
            }))
        }
      ])
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mb: 4 }}>
        <Paper elevation={3}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Course" disabled={isTabDisabled(0)} />
            <Tab label="Players" disabled={isTabDisabled(1)} />
            <Tab label="Hole by Hole" disabled={isTabDisabled(2)} />
            <Tab label="Scorecard" disabled={isTabDisabled(3)} />
            <Tab label="Games" disabled={isTabDisabled(4)} />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <Typography variant="h5" gutterBottom>
              Course Selection
            </Typography>
            <CourseList onCourseSelect={handleCourseSelect} selectedCourseId={selectedCourseId} />
            {selectedCourseId && courseData?.golfCourse && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Selected Course
                </Typography>
                <Typography variant="body1">
                  {courseData.golfCourse.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {courseData.golfCourse.address}
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            {selectedCourseId && courseData?.golfCourse && (
              <PlayerForm
                onAddPlayer={handleAddPlayer}
                tees={courseData.golfCourse.tees}
                players={players}
              />
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            {selectedCourseId && players.length > 0 && courseData?.golfCourse && (
              <HoleByHole
                players={players}
                currentHole={currentHole}
                onCurrentHoleChange={setCurrentHole}
                scores={scores}
                onScoreChange={handleScoreChange}
                playerTees={getPlayerTees()}
                bankerData={selectedGames.includes('banker') ? bankerHoleData : undefined}
                onBankerDataChange={selectedGames.includes('banker') ? handleBankerDataChange : undefined}
              />
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            {selectedCourseId && players.length > 0 && courseData?.golfCourse && (
              <Scorecard
                players={players}
                scores={scores}
                onScoreChange={handleScoreChange}
                playerTees={getPlayerTees()}
              />
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={4}>
            {selectedCourseId && players.length > 0 && courseData?.golfCourse && (
              <Game 
                players={players}
                selectedGames={selectedGames}
                onGameChange={handleGameChange}
              />
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};
