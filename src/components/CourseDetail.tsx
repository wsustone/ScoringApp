import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_COURSE } from '../graphql/queries';
import { GolfCourse, Hole } from '../graphql/types';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import { useState } from 'react';

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

function HoleTable({ holes }: { holes: Hole[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Hole</TableCell>
          <TableCell>Par</TableCell>
          <TableCell>Stroke Index</TableCell>
          <TableCell>Distance (yards)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {holes.map((hole) => (
          <TableRow key={hole.number}>
            <TableCell>{hole.number}</TableCell>
            <TableCell>{hole.par}</TableCell>
            <TableCell>{hole.strokeIndex}</TableCell>
            <TableCell>{hole.distance}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const CourseDetail = () => {
  const { name } = useParams<{ name: string }>();
  const [selectedTee, setSelectedTee] = useState(0);
  const { loading, error, data } = useQuery<{ course: GolfCourse }>(GET_COURSE, {
    variables: { name },
  });

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (!data?.course) return <Typography>Course not found</Typography>;

  const { course } = data;
  const allTees = [...course.menTees, ...course.ladyTees];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {course.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Location: {course.location}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={selectedTee} onChange={(_, newValue) => setSelectedTee(newValue)}>
          {allTees.map((tee, index) => (
            <Tab key={tee.name} label={tee.name} />
          ))}
        </Tabs>
      </Box>

      {allTees.map((tee, index) => (
        <TabPanel key={tee.name} value={selectedTee} index={index}>
          <Typography variant="h6" gutterBottom>
            Course Rating: {tee.courseRating} | Slope Rating: {tee.slopeRating}
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Front Nine
          </Typography>
          <Paper sx={{ mb: 2 }}>
            <HoleTable holes={tee.front9Holes} />
          </Paper>

          <Typography variant="h6" gutterBottom>
            Back Nine
          </Typography>
          <Paper>
            <HoleTable holes={tee.back9Holes} />
          </Paper>
        </TabPanel>
      ))}
    </Box>
  );
};
