import { gql } from '@apollo/client';

export const GET_GOLF_COURSES = gql`
  query GetGolfCourses {
    golfCourses {
      id
      name
      location
      tees {
        id
        name
        gender
        courseRating
        slopeRating
      }
    }
  }
`;

export const GET_GOLF_COURSE = gql`
  query GetGolfCourse($id: ID!) {
    golfCourse(id: $id) {
      id
      name
      location
      tees {
        id
        name
        gender
        courseRating
        slopeRating
        holes {
          id
          number
          par
          strokeIndex
          distance
        }
      }
    }
  }
`;

export const GET_COURSE_HOLES = gql`
  query GetCourseHoles($courseId: ID!) {
    golfCourse(id: $courseId) {
      id
      tees {
        holes {
          number
          par
          strokeIndex
        }
      }
    }
  }
`;
