import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { CourseDetail } from './components/CourseDetail';

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
          <Typography variant="h6">
            Golf Scoring App
          </Typography>
        </Toolbar>
      </AppBar>
      <CourseDetail />
    </ThemeProvider>
  );
}

export default App;
