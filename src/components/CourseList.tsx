import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_GOLF_COURSES } from '../graphql/queries';

interface GolfCourse {
  id: string;
  name: string;
  tees: {
    id: string;
    name: string;
    gender: string;
  }[];
}

interface CourseListProps {
  onCourseSelect: (courseId: string) => void;
  selectedCourseId: string | null;
}

export const CourseList = ({ onCourseSelect, selectedCourseId }: CourseListProps) => {
  const { loading, error, data } = useQuery(GET_GOLF_COURSES);

  if (loading) {
    return <Typography>Loading courses...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading courses: {error.message}</Typography>;
  }

  const courses = data?.golfCourses || [];

  return (
    <FormControl fullWidth>
      <InputLabel id="course-select-label">Select Course</InputLabel>
      <Select
        labelId="course-select-label"
        id="course-select"
        value={selectedCourseId || ''}
        label="Select Course"
        onChange={(e) => onCourseSelect(e.target.value)}
      >
        {courses.map((course: GolfCourse) => (
          <MenuItem key={course.id} value={course.id}>
            {course.name} ({course.tees?.length || 0} tees)
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
