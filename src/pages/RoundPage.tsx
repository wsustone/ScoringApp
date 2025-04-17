import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Typography, CircularProgress } from '@mui/material';
import { GET_ROUND_INFO } from '../graphql/queries';
import { UPDATE_SCORE } from '../graphql/mutations';
import { HoleByHole } from '../components/HoleByHole';
import { Scorecard } from '../components/Scorecard';
import { RoundResponse } from '../types/round';
import { Score } from '../types/score';

interface GetRoundResponse {
  get_round: RoundResponse;
}

export const RoundPage = () => {
  const { id } = useParams<{ id: string }>();

  const { loading, error, data } = useQuery<GetRoundResponse>(GET_ROUND_INFO, {
    variables: { id },
    skip: !id,
  });

  const [updateScore] = useMutation(UPDATE_SCORE);

  const handleScoreUpdate = (
    player_id: string,
    hole_id: string,
    score: number | null | undefined
  ) => {
    try {
      const round = data?.get_round;
      if (!round) {
        throw new Error('Round not found');
      }

      const existingScore = round.scores.find(
        (s: Score) => s.player_id === player_id && s.hole_id === hole_id
      );

      if (existingScore) {
        updateScore({
          variables: {
            id: existingScore.id,
            score: score ?? null,
            gross_score: score ?? null,
            net_score: score ?? null,
            strokes_received: score !== null ? 1 : 0
          },
        });
      }
    } catch (error: any) {
      console.error('Error updating score:', error);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (!data?.get_round) return <Typography>Round not found</Typography>;

  const round = data.get_round;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {round.course_id}
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <HoleByHole
          players={round.players}
          holes={[]} // TODO: Replace with actual holes array from round or course
          scores={round.scores}
          games={round.games}
          onScoreUpdate={handleScoreUpdate}
          playerTees={round.players.reduce((acc, player) => ({ ...acc, [player.id]: player.tee_id }), {})}
          strokes_received={0} // TODO: Replace with actual strokes_received if available
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Scorecard
          players={round.players}
          scores={round.scores}
          holes={round.holes || []}
          on_score_change={(player_id: string, hole_id: string, score: number | null | undefined) => {
            handleScoreUpdate(player_id, hole_id, score);
          }}
        />
      </Box>
    </Box>
  );
};

export default RoundPage;
