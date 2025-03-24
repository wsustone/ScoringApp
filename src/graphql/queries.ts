import { gql } from '@apollo/client';

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      name
      location
    }
  }
`;

export const GET_COURSE_TEES = gql`
  query GetCourseTees($name: String!) {
    courseTees(name: $name) {
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

export const GET_COURSE_DETAIL = gql`
  query GetCourseDetail($name: String!) {
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
