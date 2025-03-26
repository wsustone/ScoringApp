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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSES } from '../graphql/queries';

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
  const { loading, error: courseError, data } = useQuery(GET_GOLF_COURSES);

  const handleAddPlayer = () => {
    if (players.length >= 4) {
      setError('Maximum 4 players allowed');
      return;
    }
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: '',
      handicap: 0,
      teeId: selectedCourse?.tees?.[0]?.id || '' // Set default tee to first available tee
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

  // Find the selected course from the data
  const selectedCourse = data?.golfCourses?.find(
    (course: any) => course.id === selectedCourseId
  );

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Course</InputLabel>
          <Select
            value={selectedCourseId}
            onChange={(e) => onCourseChange(e.target.value)}
            label="Select Course"
          >
            {data?.golfCourses?.map((course: any) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Players</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPlayer}
          disabled={players.length >= 4 || !selectedCourseId}
        >
          Add Player
        </Button>
      </Box>

      {!selectedCourseId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a course first
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {players.map((player) => (
          <Paper key={player.id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Name"
                value={player.name}
                onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                sx={{ flex: 2 }}
              />
              {selectedCourse?.tees && (
                <FormControl sx={{ width: '180px' }}>
                  <InputLabel>Tee</InputLabel>
                  <Select
                    value={player.teeId}
                    onChange={(e) => handlePlayerChange(player.id, 'teeId', e.target.value)}
                    label="Tee"
                  >
                    {selectedCourse.tees.map((tee: any) => (
                      <MenuItem key={tee.id} value={tee.id}>
                        {tee.name} ({tee.gender})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField
                label="Handicap"
                type="number"
                value={player.handicap}
                onChange={(e) => handlePlayerChange(player.id, 'handicap', parseInt(e.target.value) || 0)}
                sx={{ width: '120px' }}
              />
              <IconButton
                color="error"
                onClick={() => handleRemovePlayer(player.id)}
                sx={{ ml: 'auto' }}
                disabled={players.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};
