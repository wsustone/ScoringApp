import { useQuery } from '@apollo/client';
import { GET_ACTIVE_ROUNDS } from '../graphql/queries';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Player {
  playerName: string;
  handicap: number;
}

interface Round {
  id: string;
  courseName: string;
  startTime: string;
  players: Player[];
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export function ActiveRounds() {
  const { loading, error, data } = useQuery(GET_ACTIVE_ROUNDS, {
    pollInterval: 30000, // Poll every 30 seconds for updates
  });
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={4}>
        <Typography color="error">Error loading active rounds: {error.message}</Typography>
      </Box>
    );
  }

  const rounds = data?.getActiveRounds || [];

  if (rounds.length === 0) {
    return (
      <Box m={4}>
        <Typography>No active rounds found.</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/courses')}
          sx={{ mt: 2 }}
        >
          Start New Round
        </Button>
      </Box>
    );
  }

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Active Rounds</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/courses')}
        >
          Start New Round
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rounds.map((round: Round) => (
              <TableRow key={round.id}>
                <TableCell>{round.courseName}</TableCell>
                <TableCell>{formatDate(round.startTime)}</TableCell>
                <TableCell>
                  {round.players.map(p => `${p.playerName} (${p.handicap})`).join(', ')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => navigate(`/game/${round.id}`)}
                  >
                    Continue Round
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
