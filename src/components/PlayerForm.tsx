import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GOLF_COURSES } from '../graphql/queries';
import { START_ROUND } from '../graphql/mutations';

export interface Player {
  id: string;
  name: string;
  handicap: number;
  teeId: string;
}

interface PlayerFormProps {
  players?: Player[];
  onPlayersChange: (players: Player[]) => void;
  selectedCourseId?: string;
  onCourseChange: (courseId: string) => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ 
  players = [], 
  onPlayersChange, 
  selectedCourseId = '', 
  onCourseChange 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [startedRounds, setStartedRounds] = useState<Array<{id: string, courseName: string, date: string}>>([]);
  const { loading, error: courseError, data } = useQuery(GET_GOLF_COURSES);
  
  const [startRound] = useMutation(START_ROUND, {
    onCompleted: (data) => {
      const roundId = data.startRound;
      const selectedCourse = data.golfCourses.find((c: { id: string; name: string }) => c.id === selectedCourseId);
      setStartedRounds(prev => [
        ...prev,
        {
          id: roundId,
          courseName: selectedCourse?.name || 'Unknown Course',
          date: new Date().toLocaleDateString()
        }
      ]);
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleAddPlayer = () => {
    if (players.length >= 4) {
      setError('Maximum 4 players allowed');
      return;
    }
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: '',
      handicap: 0,
      teeId: selectedCourse?.tees?.[0]?.id || ''
    };
    
    onPlayersChange([...players, newPlayer]);
  };

  const handleRemovePlayer = (playerId: string) => {
    onPlayersChange(players.filter(p => p.id !== playerId));
  };

  const handlePlayerChange = (playerId: string, field: keyof Player, value: string | number) => {
    onPlayersChange(
      players.map(p => 
        p.id === playerId 
          ? { ...p, [field]: value }
          : p
      )
    );
  };

  const handleStartRound = async () => {
    if (!selectedCourseId) {
      setError('Please select a course');
      return;
    }

    if (players.length === 0) {
      setError('Please add at least one player');
      return;
    }

    if (players.some(p => !p.name)) {
      setError('All players must have names');
      return;
    }

    try {
      await startRound({
        variables: {
          courseName: selectedCourse?.name || '',
          players: players.map(p => ({
            id: p.id,
            name: p.name,
            handicap: p.handicap,
            teeId: p.teeId
          })),
          holes: selectedCourse?.tees?.[0]?.holes || [],
          gameOptions: {
            minDots: 1,
            maxDots: 3,
            dotValue: 0.25,
            doubleBirdieBets: false,
            useGrossBirdies: true,
            par3Triples: true
          }
        }
      });
    } catch (error) {
      // Error will be handled by onError callback
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (courseError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading courses: {courseError.message}
      </Alert>
    );
  }

  const courses = data?.golfCourses || [];
  const selectedCourse = courses.find(course => course.id === selectedCourseId);

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Course Selection
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Course</InputLabel>
          <Select
            value={selectedCourseId}
            onChange={(e) => onCourseChange(e.target.value)}
            label="Select Course"
          >
            {courses.map((course: { id: string; name: string }) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" gutterBottom>
          Players
        </Typography>
        {players.map((player, index) => (
          <Box key={player.id} sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <TextField
              label={`Player ${index + 1} Name`}
              value={player.name}
              onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
              fullWidth
            />
            <TextField
              label="Handicap"
              type="number"
              value={player.handicap}
              onChange={(e) => handlePlayerChange(player.id, 'handicap', parseInt(e.target.value) || 0)}
              sx={{ width: 100 }}
            />
            {selectedCourse && (
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Tee</InputLabel>
                <Select
                  value={player.teeId}
                  onChange={(e) => handlePlayerChange(player.id, 'teeId', e.target.value)}
                  label="Tee"
                >
                  {selectedCourse.tees?.map((tee: any) => (
                    <MenuItem key={tee.id} value={tee.id}>
                      {tee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <IconButton onClick={() => handleRemovePlayer(player.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddPlayer}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Add Player
        </Button>
      </Paper>

      {/* Start Round Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartRound}
          disabled={!selectedCourseId || players.length === 0 || players.some(p => !p.name)}
        >
          Start Round
        </Button>
      </Box>

      {/* Started Rounds List */}
      {startedRounds.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Started Rounds
          </Typography>
          <List>
            {startedRounds.map((round) => (
              <ListItem key={round.id}>
                <ListItemText
                  primary={round.courseName}
                  secondary={`Started on ${round.date}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};
