import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSES } from '../graphql/queries';
import { Card, CardContent, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  name: string;
  location: string;
}

export const CourseList = () => {
  const { loading, error, data } = useQuery(GET_GOLF_COURSES);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Golf Courses
      </Typography>
      <Grid container spacing={3}>
        {data?.golfCourses.map((course: Course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card component={Link} to={`/course/${encodeURIComponent(course.name)}`} sx={{ textDecoration: 'none' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {course.name}
                </Typography>
                <Typography color="textSecondary">
                  Location: {course.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
