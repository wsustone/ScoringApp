import React from 'react';
import { Box, Typography } from '@mui/material';
import { Game, BankerGame, NassauGame, SkinsGame } from '../types/game';
import { Player } from './PlayerForm';

interface GameResultsProps {
  players: Player[];
  games: Game[];
  holes: number[];
}

// Use type guards that only check the 'type' property instead of type predicates that assert full type compatibility
const isBankerGame = (game: Game): boolean => game.type === 'banker';
const isNassauGame = (game: Game): boolean => game.type === 'nassau';
const isSkinsGame = (game: Game): boolean => game.type === 'skins';

export const GameResults: React.FC<GameResultsProps> = ({ games }) => {
  const renderBankerResults = (game: BankerGame) => {
    const settings = game.settings;
    return (
      <Box key={game.type} sx={{ mb: 4 }}>
        <Typography variant="h6">Banker Game</Typography>
        <Typography>Min Dots: {settings.min_dots}</Typography>
        <Typography>Max Dots: {settings.max_dots}</Typography>
        <Typography>Dot Value: {settings.dot_value}</Typography>
        <Typography>Double Birdie Bets: {settings.double_birdie_bets ? 'Yes' : 'No'}</Typography>
        <Typography>Use Gross Birdies: {settings.use_gross_birdies ? 'Yes' : 'No'}</Typography>
        <Typography>Par 3 Triples: {settings.par3_triples ? 'Yes' : 'No'}</Typography>
      </Box>
    );
  };

  const renderNassauResults = (game: NassauGame) => {
    const settings = game.settings;
    return (
      <Box key={game.type} sx={{ mb: 4 }}>
        <Typography variant="h6">Nassau Game</Typography>
        <Typography>Front 9 Bet: ${settings.front_nine_bet}</Typography>
        <Typography>Back 9 Bet: ${settings.back_nine_bet}</Typography>
        <Typography>Match Bet: ${settings.match_bet}</Typography>
        <Typography>Auto Press: {settings.auto_press ? 'Yes' : 'No'}</Typography>
        <Typography>Press After: {settings.press_after} holes</Typography>
      </Box>
    );
  };

  const renderSkinsResults = (game: SkinsGame) => {
    const settings = game.settings;
    return (
      <Box key={game.type} sx={{ mb: 4 }}>
        <Typography variant="h6">Skins Game</Typography>
        <Typography>Bet Amount: ${settings.bet_amount}</Typography>
        <Typography>Carry Over: {settings.carry_over ? 'Yes' : 'No'}</Typography>
      </Box>
    );
  };

  return (
    <Box>
      {games.map((game) => (
        <Box key={game.id}>
          {isBankerGame(game) && renderBankerResults(game as BankerGame)}
          {isNassauGame(game) && renderNassauResults(game as NassauGame)}
          {isSkinsGame(game) && renderSkinsResults(game as SkinsGame)}
        </Box>
      ))}
    </Box>
  );
};
