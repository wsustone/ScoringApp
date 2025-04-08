import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Typography, CircularProgress } from '@mui/material';
import { GET_ROUND } from '../graphql/queries';
import { UPDATE_SCORE } from '../graphql/mutations';
import { HoleByHole } from '../components/HoleByHole';
import { Scorecard } from '../components/Scorecard';
import { RoundResponse } from '../types/round';

interface GetRoundResponse {
  get_round: RoundResponse;
}

export const RoundPage = () => {
  const { id } = useParams<{ id: string }>();

  const { loading, error, data } = useQuery<GetRoundResponse>(GET_ROUND, {
    variables: { id },
    skip: !id,
  });

  const [updateScore] = useMutation(UPDATE_SCORE);

  const handleScoreUpdate = async (playerId: string, holeId: string, score: number) => {
    if (!id) return;

    try {
      await updateScore({
        variables: {
          input: {
            round_id: id,
            player_id: playerId,
            hole_id: holeId,
            score,
          },
        },
      });
    } catch (error) {
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
        {round.course_name}
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <HoleByHole
          players={round.players}
          scores={round.scores}
          holes={round.players[0].holes}
          games={round.games}
          onScoreUpdate={handleScoreUpdate}
          playerTees={round.player_tees}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Scorecard
          players={round.players}
          scores={round.scores}
          playerTees={round.player_tees}
          games={round.games}
          on_score_change={handleScoreUpdate}
        />
      </Box>
    </Box>
  );
};

export default RoundPage;
