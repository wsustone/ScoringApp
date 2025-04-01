import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface GolfCourse {
  id: string;
  name: string;
  tees: Array<{
    id: string;
    name: string;
    courseRating: number;
    slopeRating: number;
    holes: Array<{
      id: string;
      holeNumber: number;
      par: number;
      scoringIndex: number;
    }>;
  }>;
}

interface CourseListProps {
  courses: GolfCourse[];
  onCourseSelect: (courseId: string) => void;
  selectedCourseId: string | null;
}

export const CourseList = ({ courses, onCourseSelect, selectedCourseId }: CourseListProps) => {
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
