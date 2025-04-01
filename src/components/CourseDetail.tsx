import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_GOLF_COURSE } from '../graphql/queries';
import { 
  CircularProgress, 
  Typography, 
  Box, 
  Container, 
  Tabs, 
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useState } from 'react';
import { Scorecard } from './Scorecard';
import { Game } from './Game';
import { PlayerForm, Player } from './PlayerForm';

interface GolfHole {
  id: string;
  holeNumber: number;
  par: number;
  scoringIndex: number;
}

interface GolfTee {
  id: string;
  name: string;
  gender: string;
  courseRating: number;
  slopeRating: number;
  holes: GolfHole[];
}

interface GolfCourse {
  id: string;
  name: string;
  tees: GolfTee[];
}

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
  const [selectedTeeId, setSelectedTeeId] = useState<string>('');

  const { loading, error, data } = useQuery(GET_GOLF_COURSE, {
    variables: { id }
  });

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Typography color="error">Error: {error.message}</Typography>
  );

  const course = data?.golfCourse as GolfCourse;
  const selectedTee = course?.tees.find(tee => tee.id === selectedTeeId);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleTeeChange = (event: SelectChangeEvent<string>) => {
    setSelectedTeeId(event.target.value);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          {course?.name}
        </Typography>

        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel id="tee-select-label">Select Tee</InputLabel>
          <Select
            labelId="tee-select-label"
            id="tee-select"
            value={selectedTeeId}
            label="Select Tee"
            onChange={handleTeeChange}
          >
            {course?.tees.map(tee => (
              <MenuItem key={tee.id} value={tee.id}>
                {tee.name} ({tee.gender}) - CR: {tee.courseRating}, SR: {tee.slopeRating}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Players" />
            <Tab label="Scorecard" disabled={!selectedTeeId} />
            <Tab label="Game" disabled={!selectedTeeId || players.length === 0} />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <PlayerForm 
            players={players} 
            onPlayersChange={setPlayers} 
            selectedTeeId={selectedTeeId}
          />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {selectedTee && (
            <Scorecard 
              holes={selectedTee.holes}
              players={players}
              scores={scores}
              onScoreChange={(playerId, holeNumber, score) => {
                setScores(prev => ({
                  ...prev,
                  [playerId]: {
                    ...prev[playerId],
                    [holeNumber]: score
                  }
                }));
              }}
            />
          )}
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          {selectedTee && (
            <Game
              holes={selectedTee.holes}
              players={players}
              scores={scores}
              onScoreChange={(playerId, holeNumber, score) => {
                setScores(prev => ({
                  ...prev,
                  [playerId]: {
                    ...prev[playerId],
                    [holeNumber]: score
                  }
                }));
              }}
              currentHole={currentHole}
              onCurrentHoleChange={setCurrentHole}
            />
          )}
        </TabPanel>
      </Box>
    </Container>
  );
};
