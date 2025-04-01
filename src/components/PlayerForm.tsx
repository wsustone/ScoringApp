import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export interface Player {
  id: string;
  name: string;
  handicap: number;
  teeId: string;
}

interface PlayerFormProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  selectedTeeId: string;
}

export const PlayerForm = ({ players, onPlayersChange, selectedTeeId }: PlayerFormProps) => {
  const [playerName, setPlayerName] = useState('');
  const [handicap, setHandicap] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const handleAddPlayer = () => {
    if (!playerName.trim() || !handicap.trim() || !selectedTeeId) return;

    const newPlayer = {
      id: crypto.randomUUID(),
      name: playerName.trim(),
      handicap: parseInt(handicap),
      teeId: selectedTeeId
    };

    if (editingPlayer) {
      onPlayersChange(players.map(p => p.id === editingPlayer.id ? newPlayer : p));
      setEditingPlayer(null);
    } else {
      onPlayersChange([...players, newPlayer]);
    }

    setPlayerName('');
    setHandicap('');
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setPlayerName(player.name);
    setHandicap(player.handicap.toString());
  };

  const handleDeletePlayer = (playerId: string) => {
    onPlayersChange(players.filter(p => p.id !== playerId));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {editingPlayer ? 'Edit Player' : 'Add Player'}
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
          <FormControl fullWidth>
            <InputLabel>Name</InputLabel>
            <Select
              value={playerName}
              label="Name"
              onChange={(e) => setPlayerName(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Player 1">Player 1</MenuItem>
              <MenuItem value="Player 2">Player 2</MenuItem>
              <MenuItem value="Player 3">Player 3</MenuItem>
              <MenuItem value="Player 4">Player 4</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={5}>
          <FormControl fullWidth>
            <InputLabel>Handicap</InputLabel>
            <Select
              value={handicap}
              label="Handicap"
              onChange={(e) => setHandicap(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {Array.from({ length: 37 }, (_, i) => (
                <MenuItem key={i} value={i.toString()}>{i}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            onClick={handleAddPlayer}
            disabled={!playerName || !handicap || !selectedTeeId}
            startIcon={editingPlayer ? <EditIcon /> : <AddIcon />}
            fullWidth
          >
            {editingPlayer ? 'Update' : 'Add'}
          </Button>
        </Grid>
      </Grid>

      {players.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Handicap</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.handicap}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditPlayer(player)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePlayer(player.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
