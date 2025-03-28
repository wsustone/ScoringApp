import { Box, Grid, Button, TextField, Typography } from '@mui/material';
import { Player } from './PlayerForm';
import { GolfHole } from '../types/game';

interface GameProps {
  players: Player[];
  holes: GolfHole[];
  currentHole: number;
  onCurrentHoleChange: (hole: number) => void;
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
}

export const Game = ({
  players,
  holes,
  currentHole,
  onCurrentHoleChange,
  scores,
  onScoreChange,
}: GameProps) => {
  const currentHoleData = holes.find(h => h.number === currentHole);

  const handlePrevHole = () => {
    if (currentHole > 1) {
      onCurrentHoleChange(currentHole - 1);
    }
  };

  const handleNextHole = () => {
    if (currentHole < 18) {
      onCurrentHoleChange(currentHole + 1);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Hole {currentHole} - Par {currentHoleData?.par || 4}
            </Typography>
            <Box>
              <Button onClick={handlePrevHole} disabled={currentHole === 1}>
                Previous
              </Button>
              <Button onClick={handleNextHole} disabled={currentHole === 18}>
                Next
              </Button>
            </Box>
          </Box>
        </Grid>

        {players.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player.id}>
            <Box p={2} border={1} borderRadius={1} borderColor="divider">
              <Typography variant="subtitle1" gutterBottom>
                {player.name}
              </Typography>
              <TextField
                label="Score"
                type="number"
                value={scores[player.id]?.[currentHole] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  onScoreChange(
                    player.id,
                    currentHole,
                    value === '' ? null : parseInt(value)
                  );
                }}
                fullWidth
                size="small"
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
