import { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography, Paper } from '@mui/material';
import { CourseList } from '../components/CourseList';
import { PlayerForm } from '../components/PlayerForm';
import { Game } from '../components/Game';
import { Player } from '../components/PlayerForm';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSE } from '../graphql/queries';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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

  const isTabDisabled = (tabIndex: number) => {
    if (tabIndex === 0) return false; // Course selection is always enabled
    if (!selectedCourseId) return true; // Other tabs need a course selected
    if (tabIndex === 1) return false; // Players tab is enabled if course is selected
    return players.length === 0; // Scorecard and Game tabs need players
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Course Selection
          </Typography>
          <CourseList onCourseSelect={handleCourseSelect} selectedCourseId={selectedCourseId} />
        </Paper>

        <Paper elevation={3}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Course" disabled={isTabDisabled(0)} />
            <Tab label="Players" disabled={isTabDisabled(1)} />
            <Tab label="Scorecard" disabled={isTabDisabled(2)} />
            <Tab label="Game" disabled={isTabDisabled(3)} />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <Typography variant="subtitle1" color="textSecondary" align="center">
              Please select a course above to continue
            </Typography>
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
            {selectedCourseId && players.length > 0 && (
              <Game
                players={players}
                courseId={selectedCourseId}
                currentHole={currentHole}
                onCurrentHoleChange={setCurrentHole}
                scores={scores}
                onScoreChange={handleScoreChange}
              />
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            {selectedCourseId && players.length > 0 && (
              <Game
                players={players}
                courseId={selectedCourseId}
                currentHole={currentHole}
                onCurrentHoleChange={setCurrentHole}
                scores={scores}
                onScoreChange={handleScoreChange}
              />
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};
