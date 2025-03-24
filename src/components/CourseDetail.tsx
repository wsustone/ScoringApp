import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Container,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Scorecard } from './Scorecard';
import { Game } from './Game';
import { useQuery } from '@apollo/client';
import { GET_COURSES, GET_COURSE_TEES, GET_COURSE_DETAIL } from '../graphql/queries';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

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

interface HoleSetup {
  banker: number | null;
  dots: number;
  doubles: { [key: number]: boolean };
}

export const CourseDetail: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedTee, setSelectedTee] = useState<string>('');
  const [currentTab, setCurrentTab] = useState(0);
  const [scores, setScores] = useState<{ [key: string]: { [key: number]: number | null } }>(() => {
    const initialScores: { [key: string]: { [key: number]: number | null } } = {};
    for (let i = 0; i < 4; i++) {
      initialScores[`player${i}`] = {};
      for (let hole = 1; hole <= 18; hole++) {
        initialScores[`player${i}`][hole] = null;
      }
    }
    return initialScores;
  });

  const [holeSetups, setHoleSetups] = useState<{ [key: number]: HoleSetup }>(() => {
    const initialSetups: { [key: number]: HoleSetup } = {};
    for (let hole = 1; hole <= 18; hole++) {
      initialSetups[hole] = {
        banker: null,
        dots: 1,
        doubles: Array(4).fill(false).reduce((acc, _, i) => ({ ...acc, [i]: false }), {}),
      };
    }
    return initialSetups;
  });

  const handleHoleSetupChange = (holeNumber: number, setup: Partial<HoleSetup>) => {
    setHoleSetups(prev => ({
      ...prev,
      [holeNumber]: {
        ...prev[holeNumber],
        ...setup,
      },
    }));
  };

  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES);
  
  const { data: teesData, loading: teesLoading } = useQuery(GET_COURSE_TEES, {
    variables: { name: selectedCourse },
    skip: !selectedCourse,
  });

  const { data: courseDetail, loading: detailLoading } = useQuery(GET_COURSE_DETAIL, {
    variables: { name: selectedCourse, teeType: selectedTee?.split('-')[0], teeName: selectedTee?.split('-')[1] },
    skip: !selectedCourse || !selectedTee,
  });

  const handleCourseChange = (event: SelectChangeEvent<string>) => {
    setSelectedCourse(event.target.value);
    setSelectedTee('');
  };

  const handleTeeChange = (event: SelectChangeEvent<string>) => {
    setSelectedTee(event.target.value);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
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
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Start" />
            <Tab label="Score" disabled={!selectedTee} />
            <Tab label="Game" disabled={!selectedTee} />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Typography variant="h4" gutterBottom>
            Select Course
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Course</InputLabel>
              <Select
                value={selectedCourse}
                label="Select Course"
                onChange={handleCourseChange}
              >
                {coursesData?.courses.map((course: Course) => (
                  <MenuItem key={course.name} value={course.name}>
                    {course.name.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Select Tee</InputLabel>
              <Select
                value={selectedTee}
                label="Select Tee"
                onChange={handleTeeChange}
                disabled={!selectedCourse || teesLoading}
              >
                {getAllTees(teesData).map((tee: ExtendedTeeSet) => (
                  <MenuItem key={`${tee.type}-${tee.name}`} value={`${tee.type}-${tee.name}`}>
                    {tee.name} ({tee.type === 'men' ? "Men's" : "Ladies'"})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {selectedTee && !detailLoading && (
            <Scorecard 
              holes={getSelectedTeeHoles()} 
              scores={scores}
              setScores={setScores}
            />
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {selectedTee && !detailLoading && (
            <Game 
              playerCount={4} 
              scores={scores} 
              holes={getSelectedTeeHoles()} 
              holeSetups={holeSetups}
              onHoleSetupChange={handleHoleSetupChange}
            />
          )}
        </TabPanel>
      </Box>
    </Container>
  );
};
