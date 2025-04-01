import { Box, Typography, TextField } from '@mui/material';
import { Player } from './PlayerForm';
import { Hole, BankerGame, NassauGame, SkinsGame, BankerHoleData } from '../types/game';

interface HoleByHoleProps {
  players: Player[];
  holes: Hole[];
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
  games: (BankerGame | NassauGame | SkinsGame)[];
}

export const HoleByHole = ({ players, holes, scores, onScoreChange, games }: HoleByHoleProps) => {
  const getBankerData = (holeNumber: number): BankerHoleData | null => {
    const bankerGame = games.find(g => g.type === 'banker') as BankerGame | undefined;
    if (!bankerGame) return null;
    return bankerGame.bankerData.holes.find(h => h.holeNumber === holeNumber) || {
      holeNumber,
      winner: null,
      points: 0,
      dots: 0
    };
  };

  return (
    <Box>
      <Typography variant="h6">Hole-by-Hole Scoring</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        {holes.map(hole => (
          <Box key={hole.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Hole {hole.number}</Typography>
            {players.map(player => {
              const score = scores[player.id]?.[hole.number] ?? null;
              return (
                <TextField
                  key={`${hole.id}-${player.id}`}
                  label={`${player.name}'s Score`}
                  type="number"
                  value={score === null ? '' : score}
                  onChange={(e) => {
                    const value = e.target.value;
                    onScoreChange(
                      player.id,
                      hole.number,
                      value === '' ? null : parseInt(value, 10)
                    );
                  }}
                  sx={{ width: 100 }}
                />
              );
            })}
            {getBankerData(hole.number) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Banker:</Typography>
                <Typography>
                  {getBankerData(hole.number)?.winner || 'No winner'} 
                  ({getBankerData(hole.number)?.dots || 0} dots)
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
