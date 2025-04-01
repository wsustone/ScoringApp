import React, { useState, useEffect } from 'react';
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
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Scorecard } from './Scorecard';
import { GameComponent } from './Game';
import { PlayerForm, Player } from './PlayerForm';
import type { Hole, ExtendedGolfTee, GameType } from '../types/game';
import { useMutation, useQuery } from '@apollo/client';
import { START_ROUND } from '../graphql/mutations';
import { GET_ACTIVE_ROUNDS } from '../graphql/queries';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface GolfTee {
  id: string;
  name: string;
  gender: string;
  courseRating: number;
  slopeRating: number;
  holes: Hole[];
}

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  tees: GolfTee[];
}

interface CourseDetailProps {
  course: GolfCourse;
  onStartRound: (roundId: string) => void;
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

interface ActiveRound {
  id: string;
  date: string;
  players: Player[];
  games: Array<{ type: GameType; enabled: boolean }>;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, onStartRound }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTee, setSelectedTee] = useState(course.tees[0]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);
  const [startRoundMutation] = useMutation(START_ROUND);

  const { data: activeRoundsData, loading: activeRoundsLoading } = useQuery(GET_ACTIVE_ROUNDS, {
    variables: { courseId: course.id },
    pollInterval: 30000, // Poll every 30 seconds for updates
  });

  useEffect(() => {
    setSelectedTee(course.tees[0]);
  }, [course]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleTeeChange = (event: SelectChangeEvent<string>) => {
    const teeId = event.target.value;
    const tee = course.tees.find((t) => t.id === teeId);
    if (tee) {
      setSelectedTee(tee);
    }
  };

  const handleStartRound = async () => {
    try {
      const { data } = await startRoundMutation({
        variables: {
          input: {
            courseId: course.id,
            players: players.map((player) => ({
              id: player.id,
              name: player.name,
              teeId: player.teeId,
            })),
            games: selectedGames.map((gameType) => ({
              type: gameType,
              enabled: true,
              ...(gameType === 'banker' && {
                dotValue: 1,
                maxDots: 4,
              }),
            })),
          },
        },
      });

      if (data?.startRound) {
        onStartRound(data.startRound);
      }
    } catch (error) {
      console.error('Failed to start round:', error);
      // TODO: Add error handling UI feedback
    }
  };

  const canStartRound = players.length > 0 && selectedTee;

  const playerTees: { [key: string]: ExtendedGolfTee } = {};
  players.forEach((player) => {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {course.name}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={!canStartRound}
          onClick={handleStartRound}
          sx={{ minWidth: 150 }}
        >
          Start Round
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Course Info" />
          <Tab label="Players" />
          <Tab label="Game" />
          <Tab label="Scorecard" />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        <Typography variant="h6" gutterBottom>
          Course Details
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography>
            <strong>Name:</strong> {course.name}
          </Typography>
          <Typography>
            <strong>Location:</strong> {course.location}
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Active Rounds
        </Typography>
        {activeRoundsLoading ? (
          <Typography>Loading active rounds...</Typography>
        ) : activeRoundsData?.activeRounds?.length > 0 ? (
          <List>
            {activeRoundsData.activeRounds.map((round: ActiveRound) => (
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
                  primary={`Round started ${new Date(round.date).toLocaleString()}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Players: {round.players.map((p) => p.name).join(', ')}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        Games: {round.games.filter((g) => g.enabled).map((g) => g.type).join(', ')}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => onStartRound(round.id)}
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

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Course Layout
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Select Tee
          </Typography>
          <Select value={selectedTee.id} onChange={handleTeeChange} fullWidth>
            {course.tees.map((tee) => (
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
              {selectedTee.holes.map((hole) => (
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
          selectedTeeId={selectedTee?.id}
          tees={course.tees}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {selectedTee && (
          <GameComponent
            players={players}
            selectedGames={selectedGames}
            onGameChange={(games) => setSelectedGames(games)}
          />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        {selectedTee && (
          <Scorecard
            players={players}
            holes={selectedTee.holes}
            scores={{}}
            onScoreChange={() => {}}
            playerTees={playerTees}
            games={[]}
          />
        )}
      </TabPanel>
    </Box>
  );
};
