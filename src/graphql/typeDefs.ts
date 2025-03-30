import { gql } from '@apollo/client';

export const typeDefs = gql`
  input PlayerInput {
    id: ID!
    name: String!
    handicap: Int!
    teeId: ID!
  }

  input HoleInput {
    number: Int!
    par: Int!
    strokeIndex: Int!
    distance: Int!
  }

  input GameOptionsInput {
    minDots: Int!
    maxDots: Int!
    dotValue: Float!
    doubleBirdieBets: Boolean!
    useGrossBirdies: Boolean!
    par3Triples: Boolean!
  }
`;
