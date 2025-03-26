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
  Paper, 
  Container, 
  Tabs, 
  Tab 
} from '@mui/material';
import { useState } from 'react';
import { Scorecard } from './Scorecard';
import { Game } from './Game';
import { PlayerForm, Player } from './PlayerForm';
import { GolfCourse, HoleSetup } from '../types';

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
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '', handicap: 0 }
  ]);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [holeSetups, setHoleSetups] = useState<{ [key: number]: HoleSetup }>({});

  const { loading, error, data } = useQuery<{ golfCourse: GolfCourse }>(GET_GOLF_COURSE, {
    variables: { id },
    skip: !id,
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handlePlayerChange = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    // Initialize scores for new players
    const newScores = { ...scores };
    updatedPlayers.forEach(player => {
      if (!newScores[player.id]) {
        newScores[player.id] = {};
      }
    });
    setScores(newScores);
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
      [holeNumber]: {
        ...prev[holeNumber],
        ...setup,
      },
    }));
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (!data?.golfCourse) return <Typography>Course not found</Typography>;

  const course = data.golfCourse;

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
          <PlayerForm players={players} onPlayersChange={handlePlayerChange} />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Scorecard
            holes={course.tees[0].holes}
            players={players}
            scores={scores}
            onScoreChange={handleScoreChange}
          />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Game
            holes={course.tees[0].holes}
            players={players}
            scores={scores}
            holeSetups={holeSetups}
            onHoleSetupChange={handleHoleSetupChange}
          />
        </TabPanel>

        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {course.name}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Location: {course.location}
          </Typography>

          {course.tees.map((tee) => (
            <Box key={tee.id} sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                {tee.name} ({tee.gender})
              </Typography>
              <Typography>
                Course Rating: {tee.courseRating} | Slope Rating: {tee.slopeRating}
              </Typography>

              <Paper sx={{ mt: 2, overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hole</TableCell>
                      <TableCell>Par</TableCell>
                      <TableCell>Stroke Index</TableCell>
                      <TableCell>Distance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tee.holes.map((hole) => (
                      <TableRow key={hole.number}>
                        <TableCell>{hole.number}</TableCell>
                        <TableCell>{hole.par}</TableCell>
                        <TableCell>{hole.strokeIndex}</TableCell>
                        <TableCell>{hole.distance}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};
