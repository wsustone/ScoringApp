import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './graphql/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { GamePage } from './pages/GamePage';
import { CourseDetail } from './components/CourseDetail';
import { Dashboard } from './pages/Dashboard';
import { AddPlayer } from './pages/AddPlayer';
import { EditPlayer } from './pages/EditPlayer';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: 'add-player/:courseId',
        element: <AddPlayer />,
      },
      {
        path: 'edit-player/:courseId/:playerId',
        element: <EditPlayer />,
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
