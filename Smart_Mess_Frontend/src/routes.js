import React, { useEffect, useContext, Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import ApiContext from './Context/apiContext';
import { Backdrop } from '@mui/material';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const Page404 = React.lazy(() => import('./pages/Page404'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const DashboardAppPage = React.lazy(() => import('./pages/DashboardAppPage'));
const ManagerAddFood = React.lazy(() => import('./pages/ManagerAddFood'));
const FeedBackForm = React.lazy(() => import('./pages/FeedBackForm'));
const ManagerDashboard = React.lazy(() => import('./pages/ManagerDashboard'));
const AnnouncementForm = React.lazy(() => import('./pages/Announcement'));
const MyMenuPage = lazy(() => import('./pages/MyMenuPage'));
const RatingsPage = lazy(() => import('./pages/RatingsPage'));
const Suggestions = lazy(() => import('./pages/user/Suggestions'));
const SuggestionComments = lazy(() => import('./pages/user/SuggestionComments'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

// ----------------------------------------------------------------------

const DashboardIndexRedirect = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (['manager', 'secy', 'dean'].includes(user.Role)) {
        return <Navigate to="/dashboard/summary" replace />;
      }
    } catch (err) {
      console.error(err);
    }
  }
  return <Navigate to="/dashboard/app" replace />;
};

export default function Router() {
  const context = useContext(ApiContext);
  const { getAllNotificatons } = context;

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getAllNotificatons();
    }
    navigator.serviceWorker.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'notification') {
        console.log('communication from service worker');
        if (localStorage.getItem('token')) {
          getAllNotificatons();
        }
      }
    });
  }, []);


  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <DashboardIndexRedirect />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        // { path: 'menu', element: <MenuPage /> },
        { path: 'products', element: <ProductsPage /> },
        {
          path: 'ratings',
          element: (
            <Suspense fallback={<Backdrop open={false} />}>
              <RatingsPage />
            </Suspense>
          ),
        },
        { path: 'products', element: <ProductsPage /> },
        { path: 'analytics', element: <AnalyticsPage /> },
        { path: 'addfooditem', element: <ManagerAddFood /> },
        { path: 'feedback', element: <FeedBackForm /> },
        { path: 'announcement', element: <AnnouncementForm /> },
        {
          path: 'menuPage',
          element: <MyMenuPage />,
        },
        // { path: 'managermenupage', element: <ManagerMenuPage /> },
        { path: 'summary', element: <ManagerDashboard /> },
        { path: 'suggestions', element: <Suggestions /> },
        {
          path: 'suggestions/:suggestionId',
          element: <SuggestionComments />,
        },
      ],
    },
    {
      path: 'login',
      children: [
        { index: true, element: <LoginPage /> },
        { path: 'manager', element: <Navigate to="/login" replace /> },
        { path: 'dean', element: <Navigate to="/login" replace /> },
      ],
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/login" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
