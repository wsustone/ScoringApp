import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSES } from '../graphql/queries';
import { Player } from '../components/PlayerForm';

export const AddPlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [handicap, setHandicap] = useState(0);
  const [teeId, setTeeId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data, loading, error: courseError } = useQuery(GET_GOLF_COURSES);
  const course = data?.golfCourses?.find((c: any) => c.id === courseId);

  const handleSubmit = () => {
    if (!name) {
      setError('Please enter a player name');
      return;
    }

    if (!teeId) {
      setError('Please select a tee');
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      handicap,
      teeId
    };

    // Get existing players from localStorage or initialize empty array
    const existingPlayers = JSON.parse(localStorage.getItem('players') || '[]');
    
    // Add new player
    const updatedPlayers = [...existingPlayers, newPlayer];
    
    // Save back to localStorage
    localStorage.setItem('players', JSON.stringify(updatedPlayers));

    // Navigate back to dashboard (the selected course will be preserved in localStorage)
    navigate('/');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <Typography>Loading course details...</Typography>
      </Box>
    );
  }

  if (courseError || !course) {
    return (
      <Box m={4}>
        <Alert severity="error">
          {courseError ? courseError.message : 'Course not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Add New Player
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Player Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Handicap"
            type="number"
            value={handicap}
            onChange={(e) => setHandicap(parseInt(e.target.value) || 0)}
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel>Select Tee</InputLabel>
            <Select
              value={teeId}
              onChange={(e) => setTeeId(e.target.value)}
              label="Select Tee"
            >
              {course.tees.map((tee: any) => (
                <MenuItem key={tee.id} value={tee.id}>
                  {tee.name} ({tee.gender})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!name || !teeId}
            >
              Add Player
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
