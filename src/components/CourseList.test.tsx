import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import { CourseList } from './CourseList';
import { MockedProvider } from '@apollo/client/testing';
import { GET_GOLF_COURSES } from '../graphql/queries';

const mocks = [
  {
    request: {
      query: GET_GOLF_COURSES,
    },
    result: {
      data: {
        golfCourses: [
          {
            id: '1',
            name: 'Test Course 1',
            location: 'Test Location 1',
            teeSettings: [
              {
                id: 'tee1',
                name: 'Blue',
                courseRating: 72.0,
                slopeRating: 128,
              },
            ],
          },
          {
            id: '2',
            name: 'Test Course 2',
            location: 'Test Location 2',
            teeSettings: [
              {
                id: 'tee2',
                name: 'White',
                courseRating: 70.0,
                slopeRating: 125,
              },
            ],
          },
        ],
      },
    },
  },
];

describe('CourseList', () => {
  it('renders without crashing', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CourseList onCourseSelect={() => {}} />
      </MockedProvider>
    );
  });

  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CourseList onCourseSelect={() => {}} />
      </MockedProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
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
