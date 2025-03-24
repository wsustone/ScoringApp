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

interface ExtendedTeeSet extends TeeSet {
  type: 'men' | 'lady';
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

export const CourseDetail: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedTee, setSelectedTee] = useState<string>('');

  const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery(GET_COURSES);
  
  React.useEffect(() => {
    console.log('Courses Data:', coursesData);
    console.log('Courses Loading:', coursesLoading);
    console.log('Courses Error:', coursesError);
  }, [coursesData, coursesLoading, coursesError]);

  const { data: teesData, loading: teesLoading, error: teesError } = useQuery(GET_COURSE_TEES, {
    variables: { name: selectedCourse },
    skip: !selectedCourse,
  });

  React.useEffect(() => {
    console.log('Tees Data:', teesData);
    console.log('Tees Loading:', teesLoading);
    console.log('Tees Error:', teesError);
  }, [teesData, teesLoading, teesError]);

  const { data: courseDetail, loading: detailLoading, error: detailError } = useQuery(GET_COURSE_DETAIL, {
    variables: { name: selectedCourse },
    skip: !selectedCourse || !selectedTee,
  });

  React.useEffect(() => {
    console.log('Course Detail Data:', courseDetail);
    console.log('Course Detail Loading:', detailLoading);
    console.log('Course Detail Error:', detailError);
  }, [courseDetail, detailLoading, detailError]);

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
      ...teesData.courseTees.menTees.map((tee: TeeSet) => ({ ...tee, type: 'men' as const })),
      ...teesData.courseTees.ladyTees.map((tee: TeeSet) => ({ ...tee, type: 'lady' as const }))
    ];
    return allTees;
  };

  const getSelectedTeeHoles = () => {
    if (!courseDetail?.course) return [];
    const teeType = selectedTee.split('-')[0];
    const teeName = selectedTee.split('-')[1];
    const tees = teeType === 'men' ? courseDetail.course.menTees : courseDetail.course.ladyTees;
    const selectedTeeSet = tees.find((tee: TeeSet) => tee.name === teeName);
    
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
              {getAllTees(teesData).map((tee: ExtendedTeeSet) => (
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
