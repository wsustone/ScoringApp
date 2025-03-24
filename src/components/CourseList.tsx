import { useQuery } from '@apollo/client';
import { GET_COURSES } from '../graphql/queries';
import { GolfCourse } from '../graphql/types';
import { Card, CardContent, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

export const CourseList = () => {
  const { loading, error, data } = useQuery<{ courses: GolfCourse[] }>(GET_COURSES);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Golf Courses
      </Typography>
      <Grid container spacing={3}>
        {data?.courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.name}>
            <Card component={Link} to={`/course/${encodeURIComponent(course.name)}`} sx={{ textDecoration: 'none' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {course.name}
                </Typography>
                <Typography color="textSecondary">
                  Location: {course.location}
                </Typography>
                <Typography variant="body2">
                  Men's Tees: {course.menTees.map(tee => tee.name).join(', ')}
                </Typography>
                <Typography variant="body2">
                  Lady's Tees: {course.ladyTees.map(tee => tee.name).join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
