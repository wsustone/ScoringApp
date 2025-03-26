import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Paper,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControlLabel,
  Switch,
  Container,
  Button,
} from '@mui/material';
import { PlayerForm, Player } from './PlayerForm';
import { BankerGame } from './BankerGame';
import { GameType, HoleSetup, Hole } from '../types/game';

interface GameProps {
  holes: Hole[];
  players: Player[];
  scores: { [key: string]: { [key: number]: number | null } };
  holeSetups: { [key: number]: HoleSetup };
  onHoleSetupChange: (holeNumber: number, setup: Partial<HoleSetup>) => void;
  onScoreChange: (playerId: string, hole: number, score: number | null) => void;
  selectedCourseId: string;
  setSelectedCourseId: (courseId: string) => void;
}

interface GameRule {
  name: string;
  description: string;
  minPlayers: number;
}

const gameRules: Record<GameType, GameRule> = {
  banker: {
    name: 'Banker',
    description: 'Each player takes turns being the banker. The banker plays against all other players individually for points.',
    minPlayers: 3,
  },
  mrpar: {
    name: 'Mr. Par',
    description: 'Players compete against par on each hole. Points are awarded for beating par and deducted for scoring over par.',
    minPlayers: 1,
  },
  wolf: {
    name: 'Wolf',
    description: 'One player (the Wolf) chooses a partner after watching tee shots. The Wolf can also choose to play alone for higher points.',
    minPlayers: 4,
  },
};

export const Game: React.FC<GameProps> = ({ holes, players, scores, holeSetups, onHoleSetupChange, onScoreChange, selectedCourseId, setSelectedCourseId }) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('banker');
  const [gameStarted, setGameStarted] = useState(false);

  const handleGameChange = (event: SelectChangeEvent<string>) => {
    setSelectedGame(event.target.value as GameType);
  };

  const handleStartGame = () => {
    // Validate all players have names and tees selected
    const isValid = players.every(p => 
      p.name.trim() !== '' && 
      p.teeId !== ''
    );

    if (isValid) {
      // Initialize scores and hole setups
      const initialScores: { [key: string]: { [key: number]: number | null } } = {};
      const initialHoleSetups: { [key: number]: HoleSetup } = {};

      players.forEach(player => {
        initialScores[player.id] = {};
      });

      // Initialize 18 holes
      for (let i = 1; i <= 18; i++) {
        initialHoleSetups[i] = {
          banker: players[0].id,
          dots: 1,
          doubles: {},
          pin: null,
          teeBox: null
        };
      }

      setGameStarted(true);
    }
  };

  const handleHoleSetupChange = (holeNumber: number, setup: Partial<HoleSetup>) => {
    onHoleSetupChange(holeNumber, setup);
  };

  const getPlayerWarning = (game: GameType) => {
    const minPlayers = gameRules[game].minPlayers;
    if (players.length < minPlayers) {
      return `This game requires at least ${minPlayers} players`;
    }
    return null;
  };

  if (gameStarted) {
    return (
      <Container maxWidth="lg">
        <BankerGame 
          players={players}
          courseId={selectedCourseId}
          scores={scores}
          holes={holes}
          holeSetups={holeSetups}
          onHoleSetupChange={handleHoleSetupChange}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="h6" gutterBottom>
            Game Options
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Game</InputLabel>
            <Select
              value={selectedGame}
              label="Select Game"
              onChange={handleGameChange}
            >
              {Object.entries(gameRules).map(([value, { name }]) => (
                <MenuItem key={value} value={value}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {gameRules[selectedGame].name}
            </Typography>
            <Typography variant="body1" paragraph>
              {gameRules[selectedGame].description}
            </Typography>
            {getPlayerWarning(selectedGame) && (
              <Alert severity="warning">
                {getPlayerWarning(selectedGame)}
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Game Setup
      </Typography>
      <Grid container spacing={3}>
        {holes.map((hole) => (
          <Grid item xs={12} sm={6} md={4} key={hole.number}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hole {hole.number}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Par {hole.par} | SI {hole.strokeIndex}
                </Typography>
                
                <TextField
                  label="Pin Position"
                  value={holeSetups[hole.number]?.pin || ''}
                  onChange={(e) => handleHoleSetupChange(hole.number, { pin: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                
                <TextField
                  label="Tee Box"
                  value={holeSetups[hole.number]?.teeBox || ''}
                  onChange={(e) => handleHoleSetupChange(hole.number, { teeBox: e.target.value })}
                  fullWidth
                  margin="normal"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={holeSetups[hole.number]?.banker !== null}
                      onChange={(e) => handleHoleSetupChange(hole.number, { banker: e.target.checked ? players[0].id : null })}
                    />
                  }
                  label="Banker"
                />

                <TextField
                  label="Dots"
                  type="number"
                  value={holeSetups[hole.number]?.dots || ''}
                  onChange={(e) => handleHoleSetupChange(hole.number, { dots: parseInt(e.target.value) || 0 })}
                  fullWidth
                  margin="normal"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={Object.values(holeSetups[hole.number]?.doubles || {}).some(Boolean)}
                      onChange={(e) => handleHoleSetupChange(hole.number, { doubles: e.target.checked ? { [players[0].id]: true } : {} })}
                    />
                  }
                  label="Doubles"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <PlayerForm 
        players={players}
        onPlayersChange={(players) => console.log(players)}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
      />
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleStartGame}
          disabled={!selectedCourseId || players.some(p => !p.name.trim() || !p.teeId)}
        >
          Start Game
        </Button>
      </Box>

      {gameStarted && selectedGame === 'banker' && (
        <BankerGame
          scores={scores}
          holes={holes}
          holeSetups={holeSetups}
          onHoleSetupChange={handleHoleSetupChange}
          players={players}
          courseId={selectedCourseId}
        />
      )}

      {!gameStarted && selectedGame === 'banker' && getPlayerWarning(selectedGame) && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Add more players to start the Banker game
        </Typography>
      )}
    </Container>
  );
};
