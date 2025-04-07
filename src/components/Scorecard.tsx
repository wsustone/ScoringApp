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
import { Game } from '../types/game';
import { Hole, ExtendedGolfTee } from '../types/game';

interface Score {
  id: string;
  round_id: string;
  hole_id: string;
  player_id: string;
  score: number | null;
  timestamp: string;
}

interface ScorecardProps {
  players: PlayerRound[];
  scores: Score[];
  games: Game[];
  on_score_change: (player_id: string, hole_number: number, score: number | null) => void;
  player_tees: { [key: string]: ExtendedGolfTee };
  on_end_round?: () => void;
  on_discard_round?: () => void;
  loading?: boolean;
  error?: string;
}

interface EditScoreCellProps {
  current_score: number | null;
  on_save: (score: number | null) => void;
}

const EditScoreCell = ({ current_score, on_save }: EditScoreCellProps) => {
  const [is_editing, set_is_editing] = React.useState(false);
  const [score, set_score] = React.useState<string>(current_score?.toString() || '');

  const handle_save = () => {
    const new_score = score === '' ? null : parseInt(score, 10);
    if (new_score === null || (!isNaN(new_score) && new_score >= 1)) {
      on_save(new_score);
      set_is_editing(false);
    }
  };

  const handle_key_press = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handle_save();
    } else if (e.key === 'Escape') {
      set_is_editing(false);
      set_score(current_score?.toString() || '');
    }
  };

  return is_editing ? (
    <TextField
      autoFocus
      size="small"
      value={score}
      onChange={(e) => set_score(e.target.value)}
      onBlur={handle_save}
      onKeyDown={handle_key_press}
      inputProps={{
        style: { padding: '2px', textAlign: 'center', width: '30px' },
        min: 1,
        type: 'number'
      }}
    />
  ) : (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span>{current_score || '-'}</span>
      <IconButton
        size="small"
        onClick={() => set_is_editing(true)}
        sx={{ ml: 0.5, opacity: 0.3, '&:hover': { opacity: 1 } }}
      >
        <EditIcon fontSize="inherit" />
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

const calculate_net_score = (gross_score: number | null, handicap_strokes: number): number | null => {
  if (gross_score === null) return null;
  return gross_score - handicap_strokes;
};

const get_score_color = (score: number | null, par: number): string => {
  if (score === null) return 'inherit';
  if (score < par) return '#dc3545'; // red for under par
  if (score === par) return '#0d6efd'; // blue for par
  return 'inherit'; // black for over par
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
  games, 
  on_score_change, 
  player_tees, 
  on_end_round, 
  on_discard_round,
  loading = false,
  error
}: ScorecardProps) => {
  const theme = useTheme();
  const is_mobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Group holes by player since each player might have different tees
  const player_holes = useMemo(() => {
    return players.reduce((acc, player) => {
      const holes = player.holes || [];
      acc[player.id] = {
        front_nine: holes.filter((h: Hole) => h.number <= 9),
        back_nine: holes.filter((h: Hole) => h.number > 9)
      };
      return acc;
    }, {} as { [key: string]: { front_nine: Hole[], back_nine: Hole[] } });
  }, [players]);

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

  const get_player_score = (player_id: string, hole_number: number): number | null => {
    const score = scores.find(s => s.player_id === player_id && s.hole_id === `hole${hole_number}`);
    return score ? score.score : null;
  };

  const hole_numbers = {
    front: Array.from({ length: 9 }, (_, i) => i + 1),
    back: Array.from({ length: 9 }, (_, i) => i + 10)
  };

  const calculate_front_nine = (player_id: string): number => {
    let total = 0;
    for (const hole_number of hole_numbers.front) {
      const score = get_player_score(player_id, hole_number);
      if (score !== null) {
        total += score;
      }
    }
    return total;
  };

  const calculate_back_nine = (player_id: string): number => {
    let total = 0;
    for (const hole_number of hole_numbers.back) {
      const score = get_player_score(player_id, hole_number);
      if (score !== null) {
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
              {players[0]?.holes?.filter((h: Hole) => h.number <= 9).map((hole: Hole) => (
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
              const handicap_strokes = calculate_handicap_strokes(player.handicap, player.holes || []);
              const { front_nine: front_holes } = player_holes[player.id];
              const { net_total: front_net_total } = calculate_totals(player.id, front_holes, scores, handicap_strokes);
              
              return (
                <TableRow key={player.id}>
                  <TableCell>
                    {player.name}
                    <br />
                    <Typography variant="caption">
                      HCP: {player.handicap}
                      <br />
                      {player_tees[player.id]?.name}
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
                            on_save={(score) => on_score_change(player.id, hole.number, score)}
                          />
                        </Box>
                        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {net_score !== null ? net_score : '-'}
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
                {players[0]?.holes?.filter((h: Hole) => h.number > 9).map((hole: Hole) => (
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
                const handicap_strokes = calculate_handicap_strokes(player.handicap, player.holes || []);
                const { back_nine: back_holes } = player_holes[player.id];
                const { net_total: back_net_total } = calculate_totals(player.id, back_holes, scores, handicap_strokes);
                const { net_total: total_net } = calculate_totals(player.id, player.holes || [], scores, handicap_strokes);
                
                return (
                  <TableRow key={player.id}>
                    <TableCell>
                      {player.name}
                      <br />
                      <Typography variant="caption">
                        HCP: {player.handicap}
                        <br />
                        {player_tees[player.id]?.name}
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
                              on_save={(score) => on_score_change(player.id, hole.number, score)}
                            />
                          </Box>
                          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {net_score !== null ? net_score : '-'}
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
            onClick={on_end_round}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'End Round'}
          </Button>
        )}
        {on_discard_round && (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={on_discard_round}
            disabled={loading}
          >
            Discard Round
          </Button>
        )}
      </Box>
    </Box>
  );
};
