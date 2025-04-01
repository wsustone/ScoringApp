import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Alert
} from '@mui/material';
import { Player } from '../types/player';
import { UPDATE_SCORE } from '../graphql/mutations';
import { calculatePoints } from '../utils/scoring';

interface BankerGameProps {
  players: Player[];
  roundId: string;
  holes: Array<{ id: string; number: number; par: number }>;
  scores: Record<string, Record<number, number | null>>;
  currentHole: number;
  onScoreChange: (playerId: string, hole: number, score: number | null) => void;
}

export const BankerGame: React.FC<BankerGameProps> = ({
  players,
  roundId,
  holes,
  scores,
  currentHole,
  onScoreChange
}) => {
  const [error, setError] = useState<string | null>(null);

  const [updateScore] = useMutation<{ updateScore: boolean }>(UPDATE_SCORE, {
    onError: (error) => {
      console.error('Error updating score:', error);
      setError(error.message);
    }
  });

  const handleScoreChange = async (playerId: string, holeNumber: number, newScore: number | null) => {
    try {
      await updateScore({
        variables: {
          roundId,
          holeNumber,
          playerId,
          score: newScore
        }
      });
      onScoreChange(playerId, holeNumber, newScore);
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const calculateHolePoints = (playerId: string): number => {
    const playerScore = scores[playerId]?.[currentHole] ?? null;
    if (playerScore === null) return 0;
    const hole = holes.find(h => h.number === currentHole);
    return calculatePoints(playerScore, hole?.par || 0);
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell align="right">Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    value={scores[player.id]?.[currentHole] ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleScoreChange(
                        player.id,
                        currentHole,
                        value === '' ? null : parseInt(value, 10)
                      );
                    }}
                    size="small"
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell align="right">{calculateHolePoints(player.id)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
