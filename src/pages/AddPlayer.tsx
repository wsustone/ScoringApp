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
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSE } from '../graphql/queries';
import { Player } from '../components/PlayerForm';

export const AddPlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [handicap, setHandicap] = useState(0);
  const [teeId, setTeeId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Use GET_GOLF_COURSE instead of GET_GOLF_COURSES to get a single course
  const { data, loading, error: courseError } = useQuery(GET_GOLF_COURSE, {
    variables: { id: courseId },
    onCompleted: (data) => {
      console.log('Query completed. Data:', data);
    },
    onError: (error) => {
      console.error('Query error:', error);
    },
  });

  const course = data?.golfCourse;

  console.log('Course ID:', courseId);
  console.log('Course data:', course);
  console.log('Tee settings:', course?.teeSettings);

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
      tee_id: teeId
    };

    // Get existing players from localStorage or initialize empty array
    const existingPlayers = JSON.parse(localStorage.getItem('players') || '[]');
    
    // Add new player
    const updatedPlayers = [...existingPlayers, newPlayer];
    
    // Save back to localStorage
    localStorage.setItem('players', JSON.stringify(updatedPlayers));

    // Navigate back to dashboard
    navigate('/');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <CircularProgress />
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
          Add New Player - {course.name}
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
              {course?.teeSettings?.map((tee: { id: string; name: string; courseRating: number; slopeRating: number }) => (
                <MenuItem key={tee.id} value={tee.id}>
                  {tee.name} (Rating: {tee.courseRating}, Slope: {tee.slopeRating})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Add Player
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
