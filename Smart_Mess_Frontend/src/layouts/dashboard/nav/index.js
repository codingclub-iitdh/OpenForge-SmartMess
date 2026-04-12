import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Link, Drawer, Typography, Avatar } from '@mui/material';
// mock
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import navConfig from './config';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: 'rgba(255, 173, 74, 0.12)', // Gold-tinted translucent
  border: '1px solid rgba(255, 173, 74, 0.15)',
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const { pathname } = useLocation();
  const [user, setUser] = useState({});
  const [navSectionData, setNavSectionData] = useState([]);
  const getUser = async () => {
    let user = await localStorage.getItem('user');
    user = await JSON.parse(user);
    setUser(user);
    // console.log(user)
    const filterNavData = navConfig.filter((item) => item.roles.includes(user?.Role) || item.roles.includes('all'));
    setNavSectionData(filterNavData);
    // setNavSectionData(navConfig)
  };
  useEffect(() => {
    try {
      getUser();
    } catch (error) {
      console.log('error');
    }
  }, []);
  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* Logo + Branding */}
      <Box sx={{ px: 2.5, py: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Logo sx={{ width: 48, height: 48, filter: 'brightness(0) invert(1) brightness(1.1)' }} />
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#ffad4a',
              fontWeight: 700,
              fontSize: '1.05rem',
              letterSpacing: '0.5px',
              lineHeight: 1.2,
            }}
          >
            SmartMess
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.65rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            IIT Dharwad
          </Typography>
        </Box>
      </Box>

      {/* User Account Card */}
      <Box sx={{ mb: 4, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            <Avatar src={user?.Image} alt="photoURL" sx={{ border: '2px solid rgba(255,173,74,0.4)' }} />

            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>
                {user?.Username}
              </Typography>

              <Typography variant="body2" sx={{ color: '#ffad4a', fontWeight: 500, fontSize: '0.75rem' }}>
                {(() => {
                  const roleMap = { dean: 'SW Office', manager: 'Manager', secy: 'Secretary', user: 'Student' };
                  return roleMap[user?.Role] || user?.Role?.charAt(0).toUpperCase() + user?.Role?.slice(1);
                })()}
              </Typography>
            </Box>
          </StyledAccount>
        </Link>
      </Box>

      <NavSection data={navSectionData} />

      <Box sx={{ flexGrow: 1 }} />

      {/* Bottom Gold Accent Bar */}
      <Box
        sx={{
          mx: 2.5,
          mb: 2,
          height: '3px',
          borderRadius: '2px',
          background: 'linear-gradient(90deg, #ffad4a 0%, rgba(255,173,74,0.2) 100%)',
        }}
      />
    </Scrollbar>
  );

  const sidebarPaperStyles = {
    width: NAV_WIDTH,
    background: 'linear-gradient(180deg, #6c1b85 0%, #4A0E6B 60%, #2E0845 100%)',
    color: '#fff',
    borderRight: 'none',
    boxShadow: '4px 0 24px rgba(108, 27, 133, 0.2)',
  };

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: sidebarPaperStyles,
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: sidebarPaperStyles,
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
