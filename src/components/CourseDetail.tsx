import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_GOLF_COURSE } from '../graphql/queries';
import { 
  CircularProgress, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Container, 
  Tabs, 
  Tab 
} from '@mui/material';
import { useState } from 'react';
import { Scorecard } from './Scorecard';
import { Game } from './Game';
import { PlayerForm, Player } from './PlayerForm';
import { TeeSet, Hole } from '../graphql/types';
import { HoleSetup } from '../types/game';

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
  const [holeSetups, setHoleSetups] = useState<{ [key: number]: HoleSetup }>({});
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

  const handleHoleSetupChange = (holeNumber: number, setup: Partial<HoleSetup>) => {
    setHoleSetups(prev => ({
      ...prev,
      [holeNumber]: { ...prev[holeNumber], ...setup },
    }));
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (!data?.golfCourse) return <Typography>Course not found</Typography>;

  const course = data.golfCourse;
  const holes = [...course.menTees[0].front9Holes, ...course.menTees[0].back9Holes];

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
            holeSetups={holeSetups}
            onHoleSetupChange={handleHoleSetupChange}
            onScoreChange={(playerId: string, hole: number, score: number | null) => {
              setScores(prev => ({
                ...prev,
                [playerId]: {
                  ...prev[playerId],
                  [hole]: score
                }
              }));
            }}
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
          />
        </TabPanel>

        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {course.name}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Location: {course.location}
          </Typography>

          {course.menTees.map((tee: TeeSet) => (
            <Box key={tee.name} sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                {tee.name} (Men)
              </Typography>
              <Typography>
                Course Rating: {tee.courseRating} | Slope Rating: {tee.slopeRating}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Front 9
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hole</TableCell>
                      <TableCell>Par</TableCell>
                      <TableCell>Distance</TableCell>
                      <TableCell>SI</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tee.front9Holes.map((hole: Hole) => (
                      <TableRow key={hole.number}>
                        <TableCell>{hole.number}</TableCell>
                        <TableCell>{hole.par}</TableCell>
                        <TableCell>{hole.distance}</TableCell>
                        <TableCell>{hole.strokeIndex}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};
