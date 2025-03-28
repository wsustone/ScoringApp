import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Game } from '../components/Game';
import { Player, PlayerForm } from '../components/PlayerForm';
import { GameType, GolfHole } from '../types/game';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import { Scorecard } from '../components/Scorecard';
import { GET_COURSE_HOLES } from '../graphql/queries';

export const GamePage = () => {
  const { id: roundId } = useParams<{ id: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [gameType, setGameType] = useState<GameType>('banker');
  const [currentHole, setCurrentHole] = useState(1);

  // Get course holes data
  const { data: courseData } = useQuery(GET_COURSE_HOLES, {
    variables: { courseId: selectedCourseId },
    skip: !selectedCourseId
  });

  // Use course holes if available, otherwise use default
  const holes: GolfHole[] = courseData?.golfCourse?.tees?.[0]?.holes || Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: 4,
    strokeIndex: i + 1
  }));

  const handlePlayerChange = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    // Initialize scores for new players with all holes set to null
    const newScores = { ...scores };
    updatedPlayers.forEach(player => {
      if (!newScores[player.id]) {
        newScores[player.id] = {};
        // Initialize all holes with null scores
        for (let i = 1; i <= 18; i++) {
          newScores[player.id][i] = null;
        }
      }
    });
    setScores(newScores);
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleScoreChange = (playerId: string, hole: number, score: number | null) => {
    setScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [hole]: score
      }
    }));
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Players" />
          <Tab label="Scorecard" disabled={!selectedCourseId || players.length === 0} />
          <Tab label="Game" disabled={!selectedCourseId || players.length === 0} />
        </Tabs>
      </Paper>

      {selectedTab === 0 && (
        <PlayerForm 
          players={players} 
          onPlayersChange={handlePlayerChange}
          selectedCourseId={selectedCourseId}
          onCourseChange={handleCourseChange}
        />
      )}

      {selectedTab === 1 && (
        <Scorecard
          holes={holes}
          players={players}
          scores={scores}
          onScoreChange={handleScoreChange}
          selectedCourseId={selectedCourseId}
        />
      )}

      {selectedTab === 2 && (
        <Game
          holes={holes}
          players={players}
          scores={scores}
          currentHole={currentHole}
          onCurrentHoleChange={setCurrentHole}
          gameType={gameType}
          onGameTypeChange={setGameType}
          onScoreChange={handleScoreChange}
          roundId={roundId}
        />
      )}
    </Box>
  );
};
