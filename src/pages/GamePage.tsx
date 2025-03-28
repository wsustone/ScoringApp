import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Game } from '../components/Game';
import { Player } from '../components/PlayerForm';
import type { GolfHole } from '../types/game';
import { Box, Paper, Tab, Tabs, Typography, Alert, CircularProgress } from '@mui/material';
import { Scorecard } from '../components/Scorecard';
import { GET_ROUND } from '../graphql/queries';

export const GamePage = () => {
  const { id: roundId } = useParams<{ id: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentHole, setCurrentHole] = useState(1);

  const { loading, error, data } = useQuery(GET_ROUND, {
    variables: { id: roundId },
    skip: !roundId
  });

  useEffect(() => {
    if (data?.getRound) {
      const round = data.getRound;
      
      // Convert round players to Player type
      const roundPlayers = round.players.map((p: any) => ({
        id: p.playerId,
        name: p.playerName,
        handicap: p.handicap,
        teeId: p.teeId
      }));
      setPlayers(roundPlayers);

      // Initialize scores from round data
      const roundScores: { [key: string]: { [key: number]: number | null } } = {};
      round.players.forEach((player: any) => {
        roundScores[player.playerId] = {};
        round.holes.forEach((hole: any) => {
          const score = round.scores.find(
            (s: any) => s.playerId === player.playerId && s.holeId === hole.id
          );
          roundScores[player.playerId][hole.number] = score ? score.score : null;
        });
      });
      setScores(roundScores);
    }
  }, [data]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data?.getRound) {
    return (
      <Box m={4}>
        <Alert severity="error">
          {error ? error.message : 'Round not found'}
        </Alert>
      </Box>
    );
  }

  const round = data.getRound;
  const holes: GolfHole[] = round.holes.map((hole: any) => ({
    number: hole.number,
    par: hole.par,
    strokeIndex: hole.strokeIndex || hole.number
  }));

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleScoreChange = (playerId: string, holeNumber: number, score: number | null) => {
    setScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [holeNumber]: score
      }
    }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {round.courseName} - Round
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Game" />
            <Tab label="Scorecard" />
          </Tabs>
        </Box>

        {selectedTab === 0 && (
          <Game
            players={players}
            holes={holes}
            currentHole={currentHole}
            onCurrentHoleChange={setCurrentHole}
            scores={scores}
            onScoreChange={handleScoreChange}
          />
        )}

        {selectedTab === 1 && (
          <Scorecard
            players={players}
            holes={holes}
            scores={scores}
            onScoreChange={handleScoreChange}
          />
        )}
      </Paper>
    </Box>
  );
};
