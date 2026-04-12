import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { gapi } from 'gapi-script';
import { useGoogleLogin } from '@react-oauth/google';
import { Spin } from 'antd';
// @mui
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack, useMediaQuery, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
// components
import clientId from '../constants/client-id';
import { Signin, handleNotification } from '../utils/apis';

// ----------------------------------------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isLaptop = useMediaQuery('(min-width:1020px)');
  const isTablet = useMediaQuery('(min-width:425px)') && !isLaptop;
  const isMobile = useMediaQuery('(max-width:425px)') && !isTablet;

  // Track which role the user actively clicked to ensure proper isolated routing
  const selectedRoleRef = useRef('user');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (['manager', 'secy', 'dean'].includes(user.Role)) {
          navigate('/dashboard/summary', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [navigate]);

  const googleSuccess = async (res) => {
    setLoading(true);
    console.log('google success - requested role:', selectedRoleRef.current);
    const { code } = res;
    if (code) {
      try {
        const response = await Signin(code, selectedRoleRef.current);
        if (!response || !response.ok) {
          const errText = response ? await response.text() : 'No response from server';
          alert(`Login failed: ${errText}`);
          setLoading(false);
          return;
        }
        const data = await response.json();
        if (!data.token || !data.user) {
          alert('Login failed: No token received from server');
          setLoading(false);
          return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        try {
          await handleNotification();
        } catch (notifErr) {
          console.log('Notification setup failed (non-critical):', notifErr);
        }

        // Redirect based on the active role granted by the backend
        if (['manager', 'secy', 'dean'].includes(data.user.Role)) {
          navigate('/dashboard/summary', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        alert(`Login error: ${err.message}`);
      }
    }
    setLoading(false);
  };

  const googleFailure = (err) => {
    console.log(err);
  };

  const googlelogin = useGoogleLogin({
    onSuccess: googleSuccess,
    onNonOAuthError: googleFailure,
    flow: 'auth-code',
    prompt: 'select_account',
  });

  const handleLoginClick = (role) => {
    selectedRoleRef.current = role;
    googlelogin();
  };

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId,
        scope: '',
      });
    }
    gapi.load('client', start);
    setLoading(false);
  }, []);

  return (
    <>
      <Helmet>
        <title> Portal Login | SmartMess — IIT Dharwad </title>
      </Helmet>

      <Spin spinning={loading} size="large">
        <Box
          sx={{
            position: 'relative',
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* MESS BLOCK BACKGROUND IMAGE */}
          <img
            src={`https://res.cloudinary.com/dowydptqe/image/upload/w_${isLaptop ? '3000' : isTablet ? '2000' : isMobile ? '1000' : 'auto'
              }/f_auto,q_${isLaptop ? '70' : '40'}/v1711091762/smart_mess/cec9mipskbybpcbpz0tj.jpg`}
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              position: 'absolute',
              zIndex: 0,
            }}
            alt="IIT Dharwad Mess Block"
          />
          {/* Dark Purple Overlay for readability */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(108,27,133,0.3) 0%, rgba(46,8,69,0.7) 100%)',
              zIndex: 0,
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* CENTRAL BOX CONTAINER */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              width: '90%',
              maxWidth: 920,
              minHeight: 560,
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 24px 64px 0 rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* LEFT SIDE: Institutional Branding */}
            <Box
              sx={{
                flex: { xs: 1, md: 0.45 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: { xs: 4, md: 6 },
                background: 'linear-gradient(160deg, #7b2d94 0%, #6c1b85 35%, #4A0E6B 70%, #2E0845 100%)',
                color: '#fff',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle pattern overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.04,
                  backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px),
                                    radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)`,
                  backgroundSize: '30px 30px',
                }}
              />

              {/* Logo */}
              <Box
                sx={{
                  mb: 3,
                  width: 112,
                  height: 112,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src="/college-logo.png"
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.4)' }}
                />
              </Box>

              {/* Institution Name */}
              <Typography variant="overline" sx={{ color: '#ffad4a', letterSpacing: '3px', fontSize: '0.7rem', mb: 1, position: 'relative', zIndex: 1 }}>
                Indian Institute of Technology
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '1px', position: 'relative', zIndex: 1, fontFamily: "'DM Serif Display', serif" }}>
                IIT DHARWAD
              </Typography>

              {/* Gold Divider */}
              <Box sx={{ width: 60, height: 3, borderRadius: 2, backgroundColor: '#ffad4a', mb: 3, position: 'relative', zIndex: 1 }} />

              <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.5px', position: 'relative', zIndex: 1, fontFamily: "'DM Serif Display', serif" }}>
                SmartMess
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.7)', maxWidth: 280, lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                Intelligent Mess Management System for a seamless dining experience.
              </Typography>

              {/* Sanskrit motto */}
              <Typography variant="caption" sx={{ mt: 3, color: 'rgba(255,173,74,0.6)', fontStyle: 'italic', letterSpacing: '1px', position: 'relative', zIndex: 1 }}>
                ॥ सा विद्या या विमुक्तये ॥
              </Typography>
            </Box>

            {/* RIGHT SIDE: Unified Login Actions */}
            <Box
              sx={{
                flex: { xs: 1, md: 0.55 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: { xs: 4, md: 6 },
                backgroundColor: '#fff',
              }}
            >
              <Box sx={{ width: '100%', maxWidth: 340 }}>
                {/* Welcome Header */}
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#6c1b85', fontFamily: "'DM Serif Display', serif", textAlign: 'center' }}>
                  Welcome Back!
                </Typography>
                <Typography variant="body2" sx={{ color: '#637381', mb: 4, lineHeight: 1.6, textAlign: 'center' }}>
                  Select your portal and sign in with your authorized institute email.
                </Typography>

                <Stack spacing={2.5}>
                  {/* Student Login — Gold (primary CTA) */}
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    onClick={() => handleLoginClick('user')}
                    startIcon={<GoogleIcon />}
                    sx={{
                      py: 1.8,
                      backgroundColor: '#ffad4a',
                      color: '#2E0845',
                      '&:hover': {
                        backgroundColor: '#e89520',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 24px 0 rgba(255, 173, 74, 0.35)',
                      },
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 14px 0 rgba(255, 173, 74, 0.3)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Login as Student
                  </Button>

                  <Divider sx={{ typography: 'overline', color: 'text.disabled', '&::before, ::after': { borderTopStyle: 'dashed' } }}>
                    Administration
                  </Divider>

                  {/* Manager Login — Purple */}
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    onClick={() => handleLoginClick('manager')}
                    startIcon={<GoogleIcon />}
                    sx={{
                      py: 1.8,
                      backgroundColor: '#6c1b85',
                      color: '#FFF',
                      '&:hover': {
                        backgroundColor: '#4A0E6B',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 24px 0 rgba(108, 27, 133, 0.35)',
                      },
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 14px 0 rgba(108, 27, 133, 0.24)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Login as Manager / Secy
                  </Button>

                  {/* Dean Login — Outlined Purple */}
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    onClick={() => handleLoginClick('dean')}
                    startIcon={<GoogleIcon />}
                    sx={{
                      py: 1.8,
                      borderColor: '#6c1b85',
                      color: '#6c1b85',
                      borderWidth: '2px',
                      '&:hover': {
                        backgroundColor: 'rgba(108, 27, 133, 0.06)',
                        borderColor: '#4A0E6B',
                        borderWidth: '2px',
                        transform: 'translateY(-1px)',
                      },
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Login as SW Office
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </Spin>
    </>
  );
}
