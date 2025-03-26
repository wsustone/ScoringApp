import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSES } from '../graphql/queries';
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Container } from '@mui/material';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  name: string;
  location: string;
}

export const CourseList = () => {
  const { loading, error, data } = useQuery(GET_GOLF_COURSES);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <Typography color="error">Error: {error.message}</Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Golf Courses
      </Typography>
      <Grid container spacing={3}>
        {data.golfCourses.map((course: Course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{course.name}</Typography>
                  <Typography color="textSecondary">{course.location}</Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
