import React, { useState } from 'react';
import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_COURSE_DETAILS } from '../queries/courseQueries';
import { Scorecard } from './Scorecard';
import { Game } from './Game';
import { PlayerForm, Player } from './PlayerForm';
import { Hole, HoleSetup } from '../types';

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

export const CourseDetail: React.FC = () => {
  const { courseId = '', teeSetId = '' } = useParams<{ courseId: string; teeSetId: string }>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '', handicap: 0 }
  ]);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [holeSetups, setHoleSetups] = useState<{ [key: number]: HoleSetup }>({});

  const { loading, error, data } = useQuery(GET_COURSE_DETAILS, {
    variables: { courseId, teeSetId },
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
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
  if (!data) return <Typography>No data available</Typography>;

  const holes: Hole[] = data.course.teeSets[0].holes;

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Start" />
            <Tab label="Scorecard" disabled={players.length === 0} />
            <Tab label="Game" disabled={players.length === 0} />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <PlayerForm players={players} onPlayersChange={setPlayers} />
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
          />
        </TabPanel>
      </Box>
    </Container>
  );
};
