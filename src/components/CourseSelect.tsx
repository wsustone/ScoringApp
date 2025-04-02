import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { GolfCourse } from '../types/game';

interface CourseSelectProps {
  courses: GolfCourse[];
  onCourseSelect: (course: GolfCourse) => void;
}

export const CourseSelect: React.FC<CourseSelectProps> = ({ courses, onCourseSelect }) => {
  return (
    <Grid container spacing={2}>
      {courses.map((course) => (
        <Grid item xs={12} sm={6} md={4} key={course.id}>
          <Card 
            onClick={() => onCourseSelect(course)}
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {course.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course.location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course.tees.length} tees available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
