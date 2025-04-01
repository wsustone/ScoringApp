import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  Switch,
  Typography,
  Slider,
} from '@mui/material';
import { PlayerForm, Player } from './PlayerForm';
import { GameType, ExtendedGolfTee, BankerGame } from '../types/game';

interface GameComponentProps {
  players: Player[];
  onGameChange: (games: GameType[]) => void;
  onAddPlayer: (player: Player) => void;
  availableTees: ExtendedGolfTee[];
}

interface GameOption {
  type: GameType;
  label: string;
  description: string;
  defaultSettings: GameSettings;
}

interface GameSettings {
  enabled: boolean;
  options: {
    [key: string]: any;
  };
}

const defaultBankerGame = (): Omit<BankerGame, 'id' | 'roundId'> => ({
  type: 'banker',
  minDots: 1,
  maxDots: 4,
  dotValue: 1,
  doubleBirdieBets: true,
  useGrossBirdies: false,
  par3Triples: false,
  bankerData: {
    holes: []
  }
});

const GAME_OPTIONS: GameOption[] = [
  {
    type: 'banker',
    label: 'Banker',
    description: 'One player takes on all others. Banker rotates each hole.',
    defaultSettings: {
      enabled: false,
      options: defaultBankerGame()
    }
  },
  {
    type: 'nassau',
    label: 'Nassau',
    description: 'Three separate bets: front 9, back 9, and total match.',
    defaultSettings: {
      enabled: false,
      options: {
        betAmount: 2,
        autoPress: true,
        pressEvery: 2
      }
    }
  },
  {
    type: 'skins',
    label: 'Skins',
    description: 'Each hole is a separate bet. Winner takes all.',
    defaultSettings: {
      enabled: false,
      options: {
        carryOver: true,
        valuePerSkin: 1
      }
    }
  }
];

export const GameComponent = ({
  players,
  onGameChange,
  onAddPlayer,
  availableTees
}: GameComponentProps) => {
  const [gameSettings, setGameSettings] = useState<{ [key: string]: GameSettings }>(
    GAME_OPTIONS.reduce((acc, option) => ({
      ...acc,
      [option.type]: option.defaultSettings
    }), {})
  );

  const [showBankerSettings, setShowBankerSettings] = useState(false);

  const handleGameToggle = (gameType: GameType) => {
    const newSettings = {
      ...gameSettings,
      [gameType]: {
        ...gameSettings[gameType],
        enabled: !gameSettings[gameType].enabled
      }
    };
    setGameSettings(newSettings);

    const enabledGames = GAME_OPTIONS
      .filter(option => newSettings[option.type].enabled)
      .map(option => option.type);
    onGameChange(enabledGames);
  };

  const handleBankerSettingsOpen = () => {
    setShowBankerSettings(true);
  };

  const handleBankerSettingsClose = () => {
    setShowBankerSettings(false);
  };

  const handleBankerSettingChange = (setting: keyof Omit<BankerGame, 'id' | 'roundId' | 'type' | 'bankerData'>) => (
    _: Event,
    value: number | boolean
  ) => {
    setGameSettings({
      ...gameSettings,
      banker: {
        ...gameSettings.banker,
        options: {
          ...gameSettings.banker.options,
          [setting]: value
        }
      }
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Game Selection</Typography>
      <Grid container spacing={2}>
        {GAME_OPTIONS.map(option => (
          <Grid item xs={12} key={option.type}>
            <Card>
              <CardContent>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={gameSettings[option.type].enabled}
                        onChange={() => handleGameToggle(option.type)}
                      />
                    }
                    label={option.label}
                  />
                  <FormHelperText>{option.description}</FormHelperText>
                  {option.type === 'banker' && gameSettings.banker.enabled && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleBankerSettingsOpen}
                      sx={{ mt: 1 }}
                    >
                      Configure Banker Settings
                    </Button>
                  )}
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={showBankerSettings} onClose={handleBankerSettingsClose}>
        <DialogTitle>Banker Game Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ width: 300, mt: 2 }}>
            <Typography gutterBottom>Dots per Hole</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>Min Dots</Typography>
                <Slider
                  value={gameSettings.banker.options.minDots}
                  onChange={(event, value) => handleBankerSettingChange('minDots')(event as Event, value as number)}
                  min={1}
                  max={4}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography>Max Dots</Typography>
                <Slider
                  value={gameSettings.banker.options.maxDots}
                  onChange={(event, value) => handleBankerSettingChange('maxDots')(event as Event, value as number)}
                  min={1}
                  max={4}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Dot Value ($)</Typography>
              <Slider
                value={gameSettings.banker.options.dotValue}
                onChange={(event, value) => handleBankerSettingChange('dotValue')(event as Event, value as number)}
                min={0.25}
                max={5}
                step={0.25}
                marks={[
                  { value: 0.25, label: '0.25' },
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 5, label: '5' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameSettings.banker.options.doubleBirdieBets}
                      onChange={(event) => handleBankerSettingChange('doubleBirdieBets')(event as unknown as Event, event.target.checked)}
                    />
                  }
                  label="Double Birdie Bets"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameSettings.banker.options.useGrossBirdies}
                      onChange={(event) => handleBankerSettingChange('useGrossBirdies')(event as unknown as Event, event.target.checked)}
                    />
                  }
                  label="Use Gross Birdies"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={gameSettings.banker.options.par3Triples}
                      onChange={(event) => handleBankerSettingChange('par3Triples')(event as unknown as Event, event.target.checked)}
                    />
                  }
                  label="Par 3 Triples"
                />
              </FormGroup>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Players</Typography>
        <PlayerForm onSubmit={onAddPlayer} availableTees={availableTees} />
        {players.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Added Players:</Typography>
            {players.map((player, index) => (
              <Typography key={index}>
                {player.name} ({player.tee?.name || 'No tee selected'})
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
