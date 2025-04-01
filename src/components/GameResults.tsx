import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Game, BankerGame, NassauGame } from '../types/game';
import { Player } from './PlayerForm';

interface GameResultsProps {
  players: Player[];
  games: Game[];
  holes: number[];
}

interface HoleResult {
  holeNumber: number;
  winner: string | null;
  points: number;
}

const isBankerGame = (game: Game): game is BankerGame => {
  return game.type === 'banker';
};

const isNassauGame = (game: Game): game is NassauGame => {
  return game.type === 'nassau';
};

export const GameResults: React.FC<GameResultsProps> = ({ players, games, holes }) => {
  const renderBankerResults = (game: Game) => {
    if (!isBankerGame(game)) return null;

    const holeResults: HoleResult[] = holes.map(holeNumber => ({
      holeNumber,
      winner: game.bankerData[holeNumber]?.winner || null,
      points: game.bankerData[holeNumber]?.points || 0,
    }));

    return (
      <Box key={game.type} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Banker Results
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hole</TableCell>
                <TableCell>Winner</TableCell>
                <TableCell>Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holeResults.map(result => (
                <TableRow key={result.holeNumber}>
                  <TableCell>{result.holeNumber}</TableCell>
                  <TableCell>
                    {result.winner
                      ? players.find(p => p.id === result.winner)?.name || 'Unknown'
                      : '-'}
                  </TableCell>
                  <TableCell>{result.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderNassauResults = (game: Game) => {
    if (!isNassauGame(game)) return null;

    return (
      <Box key={game.type} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Nassau Results
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Match</TableCell>
                <TableCell>Winner</TableCell>
                <TableCell>Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Front Nine</TableCell>
                <TableCell>
                  {game.nassauData.frontNine.winner
                    ? players.find(p => p.id === game.nassauData.frontNine.winner)?.name || 'Unknown'
                    : '-'}
                </TableCell>
                <TableCell>{game.nassauData.frontNine.points}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Back Nine</TableCell>
                <TableCell>
                  {game.nassauData.backNine.winner
                    ? players.find(p => p.id === game.nassauData.backNine.winner)?.name || 'Unknown'
                    : '-'}
                </TableCell>
                <TableCell>{game.nassauData.backNine.points}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Overall Match</TableCell>
                <TableCell>
                  {game.nassauData.match.winner
                    ? players.find(p => p.id === game.nassauData.match.winner)?.name || 'Unknown'
                    : '-'}
                </TableCell>
                <TableCell>{game.nassauData.match.points}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box>
      {games.map(game => {
        switch (game.type) {
          case 'banker':
            return renderBankerResults(game);
          case 'nassau':
            return renderNassauResults(game);
          default:
            return null;
        }
      })}
    </Box>
  );
};
