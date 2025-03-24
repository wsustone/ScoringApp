import { gql } from '@apollo/client';

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      name
      location
      menTees {
        name
        courseRating
        slopeRating
      }
      ladyTees {
        name
        courseRating
        slopeRating
      }
    }
  }
`;

export const GET_COURSE = gql`
  query GetCourse($name: String!) {
    course(name: $name) {
      name
      location
      menTees {
        name
        courseRating
        slopeRating
        front9Holes {
          number
          par
          strokeIndex
          distance
        }
        back9Holes {
          number
          par
          strokeIndex
          distance
        }
      }
      ladyTees {
        name
        courseRating
        slopeRating
        front9Holes {
          number
          par
          strokeIndex
          distance
        }
        back9Holes {
          number
          par
          strokeIndex
          distance
        }
      }
    }
  }
`;
