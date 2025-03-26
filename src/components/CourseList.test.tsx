import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import { CourseList } from './CourseList';
import { MockedProvider } from '@apollo/client/testing';
import { GET_GOLF_COURSES } from '../graphql/queries';
import { MemoryRouter } from 'react-router-dom';

const mocks = [
  {
    request: {
      query: GET_GOLF_COURSES,
    },
    result: {
      data: {
        golfCourses: [
          { id: '1', name: 'Test Course 1', location: 'Test Location 1' },
          { id: '2', name: 'Test Course 2', location: 'Test Location 2' },
        ],
      },
    },
  },
];

describe('CourseList', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CourseList onCourseSelect={() => {}} />
      </MemoryRouter>
    );
  });

  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CourseList onCourseSelect={() => {}} />
      </MockedProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders courses when data is loaded', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CourseList onCourseSelect={() => {}} />
      </MockedProvider>
    );
    
    // Wait for data to load
    await screen.findByText('Test Course 1');
    expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    expect(screen.getByText('Test Course 2')).toBeInTheDocument();
  });
});
