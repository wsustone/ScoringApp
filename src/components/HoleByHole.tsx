import React from 'react';
import { Box, Grid, Button, TextField, Typography } from '@mui/material';
import { Player } from './PlayerForm';
import { BankerHoleOptions } from './BankerHoleOptions';
import { Hole, GolfTee, BankerHoleData } from '../types/game';

interface HoleWithIndex extends Omit<Hole, 'roundId'> {
  scoringIndex: number;
}

interface ExtendedGolfTee extends Omit<GolfTee, 'holes'> {
  holes: HoleWithIndex[];
}

interface HoleByHoleProps {
  players: Player[];
  currentHole: number;
  onCurrentHoleChange: (hole: number) => void;
  scores: { [key: string]: { [key: number]: number | null } };
  onScoreChange: (playerId: string, holeNumber: number, score: number | null) => void;
  playerTees: { [key: string]: ExtendedGolfTee };
  bankerData?: BankerHoleData | null;
  onBankerDataChange?: (data: BankerHoleData) => void;
}

export const HoleByHole: React.FC<HoleByHoleProps> = ({
  players,
  currentHole,
  onCurrentHoleChange,
  scores,
  onScoreChange,
  playerTees,
  bankerData,
  onBankerDataChange,
}) => {
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

  const handleScoreChange = (playerId: string, value: string) => {
    const score = value ? parseInt(value, 10) : null;
    if (score !== null && (score < 1 || score > 20)) return;
    onScoreChange(playerId, currentHole, score);
  };

  const getCurrentHoleData = (playerId: string) => {
    const tee = playerTees[playerId];
    if (!tee) return null;
    return tee.holes.find((h: any) => h.holeNumber === currentHole);
  };

  const getPlayerHole = (playerId: string, holeNumber: number): HoleWithIndex | undefined => {
    const tee = playerTees[playerId];
    return tee?.holes?.find((h) => h.holeNumber === holeNumber);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              variant="contained"
              onClick={handlePrevHole}
              disabled={currentHole === 1}
            >
              Previous Hole
            </Button>
            <Typography variant="h6">
              Hole {currentHole}
            </Typography>
            <Button
              variant="contained"
              onClick={handleNextHole}
              disabled={currentHole === 18}
            >
              Next Hole
            </Button>
          </Box>
        </Grid>

        {bankerData !== undefined && onBankerDataChange && (
          <Grid item xs={12}>
            <BankerHoleOptions
              players={players}
              currentHole={currentHole}
              holeId={getCurrentHoleData(players[0]?.id)?.id || ''}
              bankerData={bankerData}
              onBankerDataChange={onBankerDataChange}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Grid container spacing={2}>
            {players.map((player) => {
              const holeData = getCurrentHoleData(player.id);
              const hole = getPlayerHole(player.id, currentHole);
              if (!holeData || !hole) return null;

              return (
                <Grid item xs={12} sm={6} md={4} key={player.id}>
                  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {player.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Par: {holeData.par}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {playerTees[player.id].name} ({playerTees[player.id].gender}) - CR: {playerTees[player.id].courseRating}, SR: {playerTees[player.id].slopeRating}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      SI: {hole.scoringIndex}
                    </Typography>
                    <TextField
                      type="number"
                      label="Score"
                      value={scores[player.id]?.[currentHole] ?? ''}
                      onChange={(e) => handleScoreChange(player.id, e.target.value)}
                      fullWidth
                      InputProps={{ inputProps: { min: 1, max: 20 } }}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
