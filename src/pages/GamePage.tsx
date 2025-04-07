import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PlayerForm } from '../components/PlayerForm';
import { GameComponent } from '../components/GameComponent';
import { Game, GolfTee } from '../types/game';
import { PlayerRound } from '../types/player';

export const GamePage: React.FC<{ tee_settings: GolfTee[]; courseId: string }> = ({ tee_settings, courseId }) => {
  const [players, setPlayers] = useState<PlayerRound[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);

  const handleGamesChange = (games: Game[]) => {
    setSelectedGames(games);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Game Setup
      </Typography>
      <PlayerForm players={players} onPlayersChange={setPlayers} teeSettings={tee_settings} />
      <Box sx={{ mt: 4 }}>
        <GameComponent selectedGames={selectedGames} onGameChange={handleGamesChange} courseId={courseId} />
      </Box>
    </Box>
  );
};
