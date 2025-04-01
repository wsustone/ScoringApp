import { gql } from '@apollo/client';

export const typeDefs = gql`
  input PlayerInput {
    id: ID!
    name: String!
    handicap: Int!
    teeID: ID!
  }
`;
