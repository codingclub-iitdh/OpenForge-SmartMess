import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import { ConfigProvider } from 'antd';
import { SocketContext, socket } from './Context/socket';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';

import ScrollToTop from './components/scroll-to-top';
import clientId from './constants/client-id';
import ApiState from './Context/apiState';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from 'react';
import Backdrop from '@mui/material/Backdrop';

// Ant Design theme — IIT Dharwad Purple/Gold
const antTheme = {
  token: {
    colorPrimary: '#6c1b85',
    colorLink: '#6c1b85',
    colorLinkHover: '#9C4DB5',
    borderRadius: 8,
    fontFamily: "'DM Sans', 'Inter', 'Roboto', sans-serif",
    colorBgContainer: '#ffffff',
    colorBorder: 'rgba(108, 27, 133, 0.15)',
    colorBorderSecondary: 'rgba(108, 27, 133, 0.08)',
  },
  components: {
    Collapse: {
      headerBg: 'rgba(108, 27, 133, 0.03)',
      contentBg: '#ffffff',
      headerPadding: '14px 16px',
      colorTextHeading: '#6c1b85',
    },
    Select: {
      colorPrimary: '#6c1b85',
      colorPrimaryHover: '#9C4DB5',
      optionSelectedBg: 'rgba(108, 27, 133, 0.08)',
    },
    Spin: {
      colorPrimary: '#6c1b85',
    },
    Button: {
      colorPrimary: '#6c1b85',
      colorPrimaryHover: '#9C4DB5',
    },
    Rate: {
      colorFillContent: 'rgba(108, 27, 133, 0.08)',
    },
  },
};

// ----------------------------------------------------------------------

export default function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <SocketContext.Provider value={socket}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ApiState>
            <HelmetProvider>
              <ConfigProvider theme={antTheme}>
                <ThemeProvider>
                  <ScrollToTop />
                  <Suspense fallback={<Backdrop open={false} />}>
                    <Router />
                  </Suspense>
                </ThemeProvider>
              </ConfigProvider>
            </HelmetProvider>
          </ApiState>
        </BrowserRouter>
      </SocketContext.Provider>
      <ToastContainer position="top-right" autoClose={2000} limit={2} />
    </GoogleOAuthProvider>
  );
}
