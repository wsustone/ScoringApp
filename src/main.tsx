import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './graphql/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { GamePage } from './pages/GamePage';
import { CourseList } from './components/CourseList';
import { CourseDetail } from './components/CourseDetail';
import { ActiveRounds } from './components/ActiveRounds';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <ActiveRounds />,
      },
      {
        path: 'courses',
        element: <CourseList onCourseSelect={() => {}} />,
      },
      {
        path: 'course/:id',
        element: <CourseDetail />,
      },
      {
        path: 'round/:id',
        element: <GamePage />,
      },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>,
);
