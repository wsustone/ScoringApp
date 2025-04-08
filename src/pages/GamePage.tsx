import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PlayerForm } from '../components/PlayerForm';
import { GameComponent } from '../components/GameComponent';
import { Game, TeeSetting } from '../types/game';
import { PlayerRound } from '../types/player';

export const GamePage: React.FC<{ tee_settings: TeeSetting[]; courseId: string }> = ({ tee_settings, courseId }) => {
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
      <GameComponent selectedGames={selectedGames} onGameChange={handleGamesChange} courseId={courseId} />
    </Box>
  );
};
