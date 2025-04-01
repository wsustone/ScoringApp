import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Scorecard } from './Scorecard';
import { GameComponent } from './Game';
import { PlayerForm, Player } from './PlayerForm';
import type { Hole, ExtendedGolfTee, GameType } from '../types/game';

interface GolfTee {
  id: string;
  name: string;
  gender: string;
  courseRating: number;
  slopeRating: number;
  holes: Hole[];
}

interface CourseDetailProps {
  course: {
    id: string;
    name: string;
    tees: GolfTee[];
  };
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTee, setSelectedTee] = useState(course.tees[0]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleTeeChange = (event: SelectChangeEvent<string>) => {
    const teeId = event.target.value;
    const tee = course.tees.find(t => t.id === teeId);
    if (tee) {
      setSelectedTee(tee);
    }
  };

  const handleScoreChange = (
    playerId: string,
    holeNumber: number,
    score: number | null
  ) => {
    setScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [holeNumber]: score,
      },
    }));
  };

  const playerTees: { [key: string]: ExtendedGolfTee } = {};
  players.forEach(player => {
    playerTees[player.id] = {
      id: selectedTee.id,
      name: selectedTee.name,
      courseRating: selectedTee.courseRating,
      slopeRating: selectedTee.slopeRating,
      holes: selectedTee.holes,
    };
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {course.name}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Course Info" />
          <Tab label="Players" />
          <Tab label="Game" />
          <Tab label="Scorecard" />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Select Tee
          </Typography>
          <Select
            value={selectedTee.id}
            onChange={handleTeeChange}
            fullWidth
          >
            {course.tees.map(tee => (
              <MenuItem key={tee.id} value={tee.id}>
                {tee.name} - CR: {tee.courseRating}, SR: {tee.slopeRating}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hole</TableCell>
                <TableCell>Par</TableCell>
                <TableCell>Distance</TableCell>
                <TableCell>Stroke Index</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedTee.holes.map(hole => (
                <TableRow key={hole.id}>
                  <TableCell>{hole.number}</TableCell>
                  <TableCell>{hole.par}</TableCell>
                  <TableCell>{hole.distance}</TableCell>
                  <TableCell>{hole.strokeIndex}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <PlayerForm
          players={players}
          onPlayersChange={setPlayers}
          selectedTeeId={selectedTee.id}
          tees={course.tees}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {selectedTee && (
          <GameComponent
            players={players}
            selectedGames={selectedGames}
            onGameChange={games => setSelectedGames(games)}
          />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        {selectedTee && (
          <Scorecard
            players={players}
            holes={selectedTee.holes}
            scores={scores}
            onScoreChange={handleScoreChange}
            playerTees={playerTees}
            games={[]}
          />
        )}
      </TabPanel>
    </Box>
  );
};
