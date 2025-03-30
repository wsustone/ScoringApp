import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_GOLF_COURSE } from '../graphql/queries';
import { 
  CircularProgress, 
  Typography, 
  Box, 
  Container, 
  Tabs, 
  Tab 
} from '@mui/material';
import { useState } from 'react';
import { Scorecard } from './Scorecard';
import { Game } from './Game';
import { PlayerForm, Player } from './PlayerForm';
import { GolfHole } from '../types/game';

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

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [currentHole, setCurrentHole] = useState<number>(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const { loading, error, data } = useQuery(GET_GOLF_COURSE, {
    variables: { id },
    skip: !id,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handlePlayerChange = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
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

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (!data?.golfCourse) return <Typography>Course not found</Typography>;

  const course = data.golfCourse;
  const holes: GolfHole[] = course.teeSettings?.[0]?.holes || [];

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="course tabs">
            <Tab label="Players" />
            <Tab label="Scorecard" disabled={players.length === 0} />
            <Tab label="Game" disabled={players.length === 0} />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <PlayerForm 
            players={players} 
            onPlayersChange={handlePlayerChange}
            selectedCourseId={selectedCourseId}
            onCourseChange={handleCourseChange}
          />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Scorecard
            holes={holes}
            players={players}
            scores={scores}
            onScoreChange={handleScoreChange}
          />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Game
            holes={holes}
            players={players}
            scores={scores}
            currentHole={currentHole}
            onCurrentHoleChange={setCurrentHole}
            onScoreChange={handleScoreChange}
          />
        </TabPanel>

        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {course.name}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {course.location}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
