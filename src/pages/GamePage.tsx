import { useState } from 'react';
import { Game } from '../components/Game';
import { Player, PlayerForm } from '../components/PlayerForm';
import { HoleSetup } from '../types/game';
import { Box, Paper, Tab, Tabs } from '@mui/material';

export const GamePage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>({});
  const [holeSetups, setHoleSetups] = useState<{ [key: number]: HoleSetup }>({});
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  // Default holes for standalone game
  const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: 4,
    strokeIndex: i + 1
  }));

  const handleHoleSetupChange = (holeNumber: number, setup: Partial<HoleSetup>) => {
    setHoleSetups(prev => ({
      ...prev,
      [holeNumber]: { ...prev[holeNumber], ...setup }
    }));
  };

  const handlePlayerChange = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    // Initialize scores for new players
    const newScores = { ...scores };
    updatedPlayers.forEach(player => {
      if (!newScores[player.id]) {
        newScores[player.id] = {};
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

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Players" />
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
        <Game
          holes={defaultHoles}
          players={players}
          scores={scores}
          holeSetups={holeSetups}
          onHoleSetupChange={handleHoleSetupChange}
          onScoreChange={(playerId: string, hole: number, score: number | null) => {
            setScores(prev => ({
              ...prev,
              [playerId]: {
                ...prev[playerId],
                [hole]: score
              }
            }));
          }}
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
        />
      )}
    </Box>
  );
};
