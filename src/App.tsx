import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { Link, Outlet } from 'react-router-dom';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Green color for golf theme
    },
    secondary: {
      main: '#558B2F',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Golf Scoring App
          </Typography>
        </Toolbar>
      </AppBar>
      <Outlet />
    </ThemeProvider>
  );
}

export default App;
