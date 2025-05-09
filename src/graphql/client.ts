import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { typeDefs } from './typeDefs';

// Match ScoringEngine's GraphQL endpoint
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.error('GraphQL Errors:', graphQLErrors);
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  }

  if (networkError) {
    console.error(`[Network error]:`, networkError);
  }
});

const httpLink = createHttpLink({
  uri: API_URL,
  credentials: 'omit', // Don't send credentials since we're allowing all origins
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add debug logging
console.log('Initializing Apollo Client with URL:', API_URL);

const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Round: {
        keyFields: ['id'],
        fields: {
          players: {
            merge(existing = [], incoming = []) {
              return [...new Set([...existing, ...incoming])];
            },
          },
          games: {
            merge(existing = [], incoming = []) {
              return [...new Set([...existing, ...incoming])];
            },
          },
        },
      },
    },
  }),
  typeDefs,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

export { apolloClient };
