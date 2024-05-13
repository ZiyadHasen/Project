import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import {
  HomeLayout,
  Landing,
  Register,
  Login,
  DashboardLayout,
  Error,
  AddJob,
  Stats,
  AllJobs,
  Profile,
  Admin,
  EditJob,
} from './pages/index';
import { action, action as registerAction } from './pages/Register';
import { action as loginAction } from './pages/Login';
import { action as AddJobAction } from './pages/AddJob';
import { loader as dashboardLoader } from './pages/DashboardLayout';
import { loader as allJobsLoader } from './pages/AllJobs';
import { loader as EditJobLoader } from './pages/EditJob';
import { action as EditJobAction } from './pages/EditJob';
import { action as DeleteJobAction } from './pages/DeleteJob';
import { loader as AdminLoader } from './pages/Admin';
import { action as ProfileAction } from './pages/Profile';

export const checkDefaultTheme = () => {
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  document.body.classList.toggle('dark-theme', isDarkTheme);
  return isDarkTheme;
};
checkDefaultTheme();

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: '/register',
        element: <Register />,
        action: registerAction,
      },
      { path: '/landing', element: <Landing /> },
      { path: '/login', element: <Login />, action: loginAction },
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        loader: dashboardLoader,
        children: [
          { index: true, element: <AddJob />, action: AddJobAction },
          {
            path: 'stats',
            element: <Stats />,
          },
          {
            path: 'all-jobs',
            element: <AllJobs />,
            loader: allJobsLoader,
          },
          {
            path: 'profile',
            element: <Profile />,
            action: ProfileAction,
          },
          {
            path: 'admin',
            element: <Admin />,
            loader: AdminLoader,
          },
          {
            path: 'edit-job/:id',
            element: <EditJob />,
            action: EditJobAction,
            loader: EditJobLoader,
          },
          { path: 'delete-job/:id', action: DeleteJobAction },
        ],
      },
      { path: '/error', element: <Error /> },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;