import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../test/utils';
import { CourseList } from './CourseList';

const mockCourses = [
  {
    id: '1',
    name: 'Test Course 1',
    tees: [
      {
        id: 'tee1',
        name: 'Blue',
        courseRating: 72.0,
        slopeRating: 128,
        holes: []
      },
    ],
  },
  {
    id: '2',
    name: 'Test Course 2',
    tees: [
      {
        id: 'tee2',
        name: 'White',
        courseRating: 70.0,
        slopeRating: 125,
        holes: []
      },
    ],
  },
];

describe('CourseList', () => {
  it('renders without crashing', () => {
    render(
      <CourseList 
        courses={mockCourses} 
        onCourseSelect={() => {}} 
        selectedCourseId={null}
      />
    );
    expect(screen.getByLabelText('Select Course')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    render(
      <CourseList 
        courses={[]} 
        onCourseSelect={() => {}} 
        selectedCourseId={null}
      />
    );
    expect(screen.getByLabelText('Select Course')).toBeInTheDocument();
  });

  it('renders courses when data is loaded', () => {
    render(
      <CourseList 
        courses={mockCourses} 
        onCourseSelect={() => {}} 
        selectedCourseId={null}
      />
    );
    
    // Open the select dropdown
    const selectButton = screen.getByRole('combobox');
    fireEvent.mouseDown(selectButton);

    // Now we can check for the menu items
    expect(screen.getByText(`${mockCourses[0].name} (${mockCourses[0].tees.length} tees)`)).toBeInTheDocument();
    expect(screen.getByText(`${mockCourses[1].name} (${mockCourses[1].tees.length} tees)`)).toBeInTheDocument();
  });
});
