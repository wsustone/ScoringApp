import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { CourseDetail } from './components/CourseDetail';

// Create Apollo Client
const client = new ApolloClient({
  uri: 'http://localhost:8080/query',
  cache: new InMemoryCache(),
});

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
    <ApolloProvider client={client}>
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
    </ApolloProvider>
  );
}

export default App;
