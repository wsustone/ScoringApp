import React, { useMemo } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  IconButton, 
  TextField, 
  Button,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { PlayerRound } from '../types/player';
import { Hole } from '../types/game';
import { Score } from '../types/score';

interface ScorecardProps {
  players: PlayerRound[];
  scores: Score[];
  holes: Hole[];
  on_score_change: (player_id: string, hole_id: string, score: number | undefined) => void;
  on_end_round?: (roundId: string | undefined) => void;
  on_discard_round?: (roundId: string | undefined) => void;
  loading?: boolean;
  error?: string;
  roundId?: string;
}

const EditScoreCell = ({ current_score, on_save }: { current_score: number | undefined, on_save: (score: number | undefined) => void }) => {
  const [editMode, setEditMode] = React.useState(false);
  const [score, setScore] = React.useState<string>(current_score?.toString() ?? '');

  const handleSave = () => {
    const parsedScore = score ? parseInt(score, 10) : undefined;
    if (parsedScore === undefined) {
      on_save(undefined);
    } else if (!isNaN(parsedScore)) {
      on_save(parsedScore);
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setScore(current_score?.toString() ?? '');
    setEditMode(false);
  };

  if (editMode) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          size="small"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          sx={{ mx: 1 }}
        />
        <Button variant="outlined" size="small" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" size="small" onClick={handleCancel}>
          Cancel
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography>{current_score ?? '-'}</Typography>
      <IconButton size="small" onClick={() => setEditMode(true)}>
        <EditIcon />
      </IconButton>
    </Box>
  );
};

const calculate_handicap_strokes = (handicap: number, holes: Hole[]): { [key: number]: number } => {
  const strokes: { [key: number]: number } = {};
  
  // Sort holes by stroke index
  const sorted_holes = [...holes].sort((a, b) => a.stroke_index - b.stroke_index);
  
  // Calculate strokes for each hole
  sorted_holes.forEach((hole, index) => {
    const strokes_for_hole = Math.floor(handicap / 18); // Base strokes
    const extra_stroke = index < (handicap % 18) ? 1 : 0; // Extra stroke for harder holes
    strokes[hole.number] = strokes_for_hole + extra_stroke;
  });
  
  return strokes;
};

const calculate_net_score = (gross_score: number | undefined, handicap_strokes: number): number | undefined => {
  if (gross_score === undefined) return undefined;
  return gross_score - handicap_strokes;
};

const get_score_color = (score: number | undefined, par: number): string => {
  if (score === undefined) return 'inherit';
  if (score === par) return '#0d6efd'; // blue for par
  if (score < par) return '#dc3545'; // red for under par
  if (score > par) return '#000000';
  return 'error.main';
};

const calculate_totals = (player_id: string, holes: Hole[], scores: Score[], handicap_strokes: { [key: number]: number }): { net_total: number } => {
  const player_scores = scores.filter(s => s.player_id === player_id);

  const net_total = holes.reduce((sum, hole) => {
    const score = player_scores.find(s => s.hole_id === `hole${hole.number}`)?.score;
    if (score === null || score === undefined) return sum;
    return sum + (score - (handicap_strokes[hole.number] || 0));
  }, 0);

  return { net_total };
};

const ScoreLegend = () => {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
      <Typography variant="caption" sx={{ color: '#dc3545' }}>● Under Par</Typography>
      <Typography variant="caption" sx={{ color: '#0d6efd' }}>● Par</Typography>
      <Typography variant="caption">● Over Par</Typography>
      <Tooltip title="Handicap strokes are shown with asterisks (*)">
        <Typography variant="caption" sx={{ ml: 2 }}>* Handicap Stroke</Typography>
      </Tooltip>
    </Box>
  );
};

export const Scorecard = ({ 
  players, 
  scores, 
  holes,
  on_score_change, 
  on_end_round, 
  on_discard_round,
  loading = false,
  error,
  roundId
}: ScorecardProps) => {
  const theme = useTheme();
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Group holes by player since each player might have different tees
  const player_holes = useMemo(() => {
    return players.reduce((acc, player) => {
      acc[player.id] = {
        front_nine: holes.filter((h: Hole) => h.number <= 9),
        back_nine: holes.filter((h: Hole) => h.number > 9)
      };
      return acc;
    }, {} as { [key: string]: { front_nine: Hole[], back_nine: Hole[] } });
  }, [players, holes]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const get_player_score = (player_id: string, hole_number: number): number | undefined => {
    const score = scores.find(s => s.player_id === player_id && s.hole_id === `hole${hole_number}`);
    return score ? score.score : undefined;
  };

  const hole_numbers = {
    front: Array.from({ length: 9 }, (_, i) => i + 1),
    back: Array.from({ length: 9 }, (_, i) => i + 10)
  };

  const calculate_front_nine = (player_id: string): number => {
    let total = 0;
    for (const hole_number of hole_numbers.front) {
      const score = get_player_score(player_id, hole_number);
      if (score !== undefined) {
        total += score;
      }
    }
    return total;
  };

  const calculate_back_nine = (player_id: string): number => {
    let total = 0;
    for (const hole_number of hole_numbers.back) {
      const score = get_player_score(player_id, hole_number);
      if (score !== undefined) {
        total += score;
      }
    }
    return total;
  };

  const calculate_total = (player_id: string): number => {
    return calculate_front_nine(player_id) + calculate_back_nine(player_id);
  };

  return (
    <Box>
      <ScoreLegend />
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxWidth: '100%',
          overflowX: 'auto',
          '.MuiTableCell-root': {
            p: is_mobile ? 1 : 2,
            minWidth: is_mobile ? '40px' : 'auto'
          }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              {holes.filter((h: Hole) => h.number <= 9).map((hole: Hole) => (
                <TableCell key={hole.id} align="center">
                  {hole.number}
                  <br />
                  Par {hole.par}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    SI {hole.stroke_index}
                  </Typography>
                </TableCell>
              ))}
              <TableCell align="center">IN</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map(player => {
              const handicap_strokes = calculate_handicap_strokes(player.handicap, holes);
              const { front_nine: front_holes } = player_holes[player.id];
              const { net_total: front_net_total } = calculate_totals(player.id, front_holes, scores, handicap_strokes);
              
              return (
                <TableRow key={player.id}>
                  <TableCell>
                    {player.name}
                    <br />
                    <Typography variant="caption">
                      HCP: {player.handicap}
                    </Typography>
                  </TableCell>
                  {front_holes.map(hole => {
                    const gross_score = get_player_score(player.id, hole.number);
                    const net_score = calculate_net_score(gross_score, handicap_strokes[hole.number] || 0);
                    
                    return (
                      <TableCell key={hole.id} align="center" sx={{ position: 'relative' }}>
                        <Box sx={{ color: get_score_color(gross_score, hole.par) }}>
                          <EditScoreCell
                            current_score={gross_score}
                            on_save={(score) => on_score_change(player.id, hole.id, score)}
                          />
                        </Box>
                        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {net_score !== undefined ? net_score : '-'}
                        </Box>
                        {handicap_strokes[hole.number] > 0 && (
                          <Tooltip title="Handicap strokes are shown with asterisks (*)">
                            <Typography
                              variant="caption"
                              sx={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                fontSize: '0.6rem',
                              }}
                            >
                              {'*'.repeat(handicap_strokes[hole.number])}
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    {calculate_front_nine(player.id)}
                    <br />
                    <Typography variant="caption">
                      {front_net_total}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {Object.values(player_holes).some(player => player.back_nine.length > 0) && (
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            maxWidth: '100%',
            overflowX: 'auto',
            '.MuiTableCell-root': {
              p: is_mobile ? 1 : 2,
              minWidth: is_mobile ? '40px' : 'auto'
            }
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                {holes.filter((h: Hole) => h.number > 9).map((hole: Hole) => (
                  <TableCell key={hole.id} align="center">
                    {hole.number}
                    <br />
                    Par {hole.par}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      SI {hole.stroke_index}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align="center">OUT</TableCell>
                <TableCell align="center">TOT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map(player => {
                const handicap_strokes = calculate_handicap_strokes(player.handicap, holes);
                const { back_nine: back_holes } = player_holes[player.id];
                const { net_total: back_net_total } = calculate_totals(player.id, back_holes, scores, handicap_strokes);
                const { net_total: total_net } = calculate_totals(player.id, holes, scores, handicap_strokes);
                
                return (
                  <TableRow key={player.id}>
                    <TableCell>
                      {player.name}
                      <br />
                      <Typography variant="caption">
                        HCP: {player.handicap}
                      </Typography>
                    </TableCell>
                    {back_holes.map(hole => {
                      const gross_score = get_player_score(player.id, hole.number);
                      const net_score = calculate_net_score(gross_score, handicap_strokes[hole.number] || 0);
                      
                      return (
                        <TableCell key={hole.id} align="center" sx={{ position: 'relative' }}>
                          <Box sx={{ color: get_score_color(gross_score, hole.par) }}>
                            <EditScoreCell
                              current_score={gross_score}
                              on_save={(score) => on_score_change(player.id, hole.id, score)}
                            />
                          </Box>
                          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {net_score !== undefined ? net_score : '-'}
                          </Box>
                          {handicap_strokes[hole.number] > 0 && (
                            <Tooltip title="Handicap strokes are shown with asterisks (*)">
                              <Typography
                                variant="caption"
                                sx={{
                                  position: 'absolute',
                                  top: 2,
                                  right: 2,
                                  fontSize: '0.6rem',
                                }}
                              >
                                {'*'.repeat(handicap_strokes[hole.number])}
                              </Typography>
                            </Tooltip>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell align="center">
                      {calculate_back_nine(player.id)}
                      <br />
                      <Typography variant="caption">
                        {back_net_total}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {calculate_total(player.id)}
                      <br />
                      <Typography variant="caption">
                        {total_net}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {on_end_round && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => on_end_round?.(roundId)}
            disabled={loading || !roundId}
          >
            {loading ? <CircularProgress size={24} /> : 'End Round'}
          </Button>
        )}
        {on_discard_round && (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => on_discard_round?.(roundId)}
            disabled={loading || !roundId}
          >
            Discard Round
          </Button>
        )}
      </Box>
    </Box>
  );
};
