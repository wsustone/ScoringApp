import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Player, PlayerForm } from '../components/PlayerForm';
import { GameComponent } from '../components/Game';
import { GameType, Game, GolfTee, createGame } from '../types/game';

export const GamePage: React.FC<{ tees: GolfTee[] }> = ({ tees }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);

  const handleGameChange = (gameTypes: GameType[]) => {
    const games = gameTypes.map(type => createGame(type, 'temp-id'));
    setSelectedGames(games);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Game Setup
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
            onPlayersChange={setPlayers}
            players={players}
            tees={tees}
          />
          {players.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Added Players:</Typography>
              {players.map((player, index) => (
                <Typography key={index}>
                  {player.name} ({tees.find(t => t.id === player.teeId)?.name || 'No tee selected'})
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
