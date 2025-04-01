import { useNavigate } from 'react-router-dom';
import { CourseList } from '../components/CourseList';
import { Container } from '@mui/material';

export const Dashboard = () => {
  const navigate = useNavigate();

  const handleCourseSelect = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <Container maxWidth="lg">
      <CourseList onCourseSelect={handleCourseSelect} />
    </Container>
  );
};
