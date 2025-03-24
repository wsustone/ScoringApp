import { gql } from '@apollo/client';

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      name
      teeSets {
        id
        name
      }
    }
  }
`;

export const GET_COURSE_DETAILS = gql`
  query GetCourseDetails($courseId: ID!, $teeSetId: ID!) {
    course(id: $courseId) {
      id
      name
      teeSets(id: $teeSetId) {
        id
        name
        holes {
          number
          par
          handicap
          yardage
        }
      }
    }
  }
`;
