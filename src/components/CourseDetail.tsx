import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Player, PlayerForm } from './PlayerForm';
import { GameComponent } from './Game';
import { GameType, Game, GolfTee, createGame } from '../types/game';

interface CourseDetailProps {
  courseName: string;
  tee_settings: GolfTee[];
  onStartRound: (players: Player[], games: Game[]) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({
  courseName,
  tee_settings,
  onStartRound,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);

  const handleGameChange = (gameTypes: GameType[]) => {
    const games = gameTypes.map(type => createGame(type, 'temp-id'));
    setSelectedGames(games);
  };

  const handleStartRound = () => {
    onStartRound(players, selectedGames);
  };

  const canStartRound = players.length > 0 && selectedGames.length > 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {courseName}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Select Games
        </Typography>
        <GameComponent
          onGameChange={handleGameChange}
          selectedGames={selectedGames}
        />
      </Box>

      {selectedGames.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Add Players
          </Typography>
          <PlayerForm
            tee_settings={tee_settings}
            onPlayersChange={setPlayers}
            players={players}
          />
          {players.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Added Players:</Typography>
              {players.map((player, index) => (
                <Typography key={index}>
                  {player.name} - {tee_settings.find(t => t.id === player.tee_id)?.name} (HCP: {player.handicap})
                </Typography>
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleStartRound}
            disabled={!canStartRound}
            sx={{ mt: 2 }}
          >
            Start Round
          </Button>
        </Box>
      )}
    </Box>
  );
};
