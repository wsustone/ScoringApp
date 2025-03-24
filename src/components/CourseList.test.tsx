import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import { CourseList } from './CourseList';
import { MockedProvider } from '@apollo/client/testing';
import { GET_COURSES } from '../graphql/queries';

const mocks = [
  {
    request: {
      query: GET_COURSES,
    },
    result: {
      data: {
        courses: [
          { id: '1', name: 'Test Course 1', holes: 18 },
          { id: '2', name: 'Test Course 2', holes: 9 },
        ],
      },
    },
  },
];

describe('CourseList', () => {
  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CourseList />
      </MockedProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders courses after loading', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CourseList />
      </MockedProvider>
    );
    
    // Wait for courses to load
    expect(await screen.findByText('Test Course 1')).toBeInTheDocument();
    expect(screen.getByText('Test Course 2')).toBeInTheDocument();
  });
});
