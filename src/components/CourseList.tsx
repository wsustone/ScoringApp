import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSES } from '../graphql/queries';
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Container, Button } from '@mui/material';

interface Course {
  id: string;
  name: string;
  location: string;
}

interface CourseListProps {
  onCourseSelect: (courseId: string) => void;
}

export const CourseList = ({ onCourseSelect }: CourseListProps) => {
  const { loading, error, data } = useQuery(GET_GOLF_COURSES);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Typography color="error">Error: {error.message}</Typography>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Golf Courses
      </Typography>
      <Grid container spacing={3}>
        {data?.golfCourses.map((course: Course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onCourseSelect(course.id)}
                  sx={{ mt: 2 }}
                >
                  Select Course
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
