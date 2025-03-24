import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_COURSES, GET_COURSE_TEES, GET_COURSE_DETAIL } from '../graphql/queries';
import {
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { Scorecard } from './Scorecard';

interface Course {
  name: string;
  location: string;
}

interface TeeSet {
  name: string;
  courseRating: number;
  slopeRating: number;
  front9Holes: Hole[];
  back9Holes: Hole[];
}

interface CourseTees {
  menTees: TeeSet[];
  ladyTees: TeeSet[];
}

interface Hole {
  number: number;
  par: number;
  strokeIndex: number;
  distance: number;
}

interface ExtendedTeeSet extends TeeSet {
  type: 'men' | 'lady';
}

export const CourseDetail: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTee, setSelectedTee] = useState('');

  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES);
  
  const { data: teesData, loading: teesLoading } = useQuery(GET_COURSE_TEES, {
    variables: { name: selectedCourse },
    skip: !selectedCourse,
  });

  const { data: courseDetail, loading: detailLoading } = useQuery(GET_COURSE_DETAIL, {
    variables: { name: selectedCourse },
    skip: !selectedCourse || !selectedTee,
  });

  const handleCourseChange = (event: SelectChangeEvent<string>) => {
    setSelectedCourse(event.target.value);
    setSelectedTee('');
  };

  const handleTeeChange = (event: SelectChangeEvent<string>) => {
    setSelectedTee(event.target.value);
  };

  const getAllTees = (teesData?: { courseTees: CourseTees }): ExtendedTeeSet[] => {
    if (!teesData) return [];
    const allTees = [
      ...teesData.courseTees.menTees.map(tee => ({ ...tee, type: 'men' as const })),
      ...teesData.courseTees.ladyTees.map(tee => ({ ...tee, type: 'lady' as const }))
    ];
    return allTees;
  };

  const getSelectedTeeHoles = () => {
    if (!courseDetail?.course) return [];
    const teeType = selectedTee.split('-')[0];
    const teeName = selectedTee.split('-')[1];
    const tees = teeType === 'men' ? courseDetail.course.menTees : courseDetail.course.ladyTees;
    const selectedTeeSet = tees.find(tee => tee.name === teeName);
    
    if (!selectedTeeSet) return [];
    return [...selectedTeeSet.front9Holes, ...selectedTeeSet.back9Holes];
  };

  if (coursesLoading) return <CircularProgress />;

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Golf Score Card
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Course</InputLabel>
          <Select
            value={selectedCourse}
            onChange={handleCourseChange}
            label="Select Course"
          >
            {coursesData?.courses.map((course: Course) => (
              <MenuItem key={course.name} value={course.name}>
                {course.name.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedCourse && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Tee</InputLabel>
            <Select
              value={selectedTee}
              onChange={handleTeeChange}
              label="Select Tee"
              disabled={teesLoading}
            >
              {getAllTees(teesData).map((tee) => (
                <MenuItem key={`${tee.type}-${tee.name}`} value={`${tee.type}-${tee.name}`}>
                  {tee.name} ({tee.type === 'men' ? "Men's" : "Ladies'"})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedTee && !detailLoading && (
          <Scorecard holes={getSelectedTeeHoles()} />
        )}
      </Box>
    </Container>
  );
};
