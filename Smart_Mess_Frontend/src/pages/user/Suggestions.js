import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Drawer,
  Fab,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SocketContext } from '../../Context/socket';
import SuggestionCard from './Suggestions/SuggestionCards';
import UserActionsList from './Suggestions/UserActionList';
import { getAllSuggestions } from './apis';
import CustomError from '../CustomErrorMessage';

const Suggestions = () => {
  const socket = useContext(SocketContext);
  const isLaptop = useMediaQuery('(min-width:1024px)');
  const isMobile = useMediaQuery('(max-width:640px)');
  const [suggestions, setSuggestions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('open');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updates, setUpdates] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('error');
    }
  }, []);

  const fetchAllSuggestions = useCallback(async () => {
    const res = await getAllSuggestions();
    const suggestionsArray = res?.data?.suggestions || [];
    const orderedSuggestions = Array.isArray(suggestionsArray)
      ? [...suggestionsArray].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [];
    setSuggestions(orderedSuggestions);
  }, []);

  useEffect(() => {
    fetchAllSuggestions();
  }, [fetchAllSuggestions]);

  useEffect(() => {
    socket.on('delete-suggestion', (deletedSuggestion) => {
      setSuggestions((current) => current.filter((entry) => entry._id !== deletedSuggestion._id));
    });
    socket.on('new-post', () => setUpdates(true));

    return () => {
      socket.off('delete-suggestion');
      socket.off('new-post');
    };
  }, [socket]);

  const filteredSuggestions = useMemo(
    () => suggestions.filter((suggestion) => suggestion.status === statusFilter),
    [suggestions, statusFilter]
  );

  const openCount = suggestions.filter((suggestion) => suggestion.status === 'open').length;
  const closedCount = suggestions.filter((suggestion) => suggestion.status === 'closed').length;
  const showComposer = !['manager', 'admin', 'secy', 'dean'].includes(user?.Role);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          mb: 3.5,
          p: { xs: 2.5, md: 4 },
          borderRadius: 8,
          color: '#fff',
          background:
            'radial-gradient(circle at top left, rgba(255, 204, 115, 0.34) 0%, rgba(255, 204, 115, 0) 34%), linear-gradient(135deg, #4b0f61 0%, #6e1d86 46%, #8e2e5f 100%)',
          boxShadow: '0 28px 80px rgba(73, 18, 92, 0.24)',
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 2, opacity: 0.9, color: '#ffcc73', fontWeight: 700 }}
              >
                Complaints
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  mt: 1,
                  fontWeight: 800,
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Community Complaints Tracker
              </Typography>
              <Typography variant="body1" sx={{ mt: 1.5, maxWidth: 760, opacity: 0.82, lineHeight: 1.9 }}>
                Complaints now keep the full official response history, clearly show who each ticket was sent to, and use a faster compact layout with less scrolling.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.2} sx={{ flexWrap: 'wrap' }}>
              <Chip
                label={`${openCount} Active`}
                sx={{ bgcolor: '#ffcc73', color: '#41124f', fontWeight: 800 }}
              />
              <Chip
                label={`${closedCount} Resolved`}
                sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff', fontWeight: 800 }}
              />
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <Stack direction="row" spacing={1.2}>
              <Button
                variant={statusFilter === 'open' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('open')}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1.1,
                  textTransform: 'none',
                  fontWeight: 800,
                  bgcolor: statusFilter === 'open' ? '#ffcc73' : 'rgba(255,255,255,0.08)',
                  color: statusFilter === 'open' ? '#41124f' : '#f5e9ff',
                  borderColor: statusFilter === 'open' ? '#ffcc73' : 'rgba(255,255,255,0.18)',
                  '&:hover': {
                    bgcolor: statusFilter === 'open' ? '#ffc24f' : 'rgba(255,255,255,0.12)',
                    borderColor: statusFilter === 'open' ? '#ffc24f' : 'rgba(255,255,255,0.28)',
                  },
                }}
              >
                Active Complaints
              </Button>
              <Button
                variant={statusFilter === 'closed' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('closed')}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1.1,
                  textTransform: 'none',
                  fontWeight: 800,
                  bgcolor: statusFilter === 'closed' ? '#f4e7ff' : 'rgba(255,255,255,0.08)',
                  color: statusFilter === 'closed' ? '#5c176e' : '#f5e9ff',
                  borderColor: statusFilter === 'closed' ? '#d7b8ef' : 'rgba(255,255,255,0.18)',
                  '&:hover': {
                    bgcolor: statusFilter === 'closed' ? '#ead5fb' : 'rgba(255,255,255,0.12)',
                    borderColor: statusFilter === 'closed' ? '#ceb0ea' : 'rgba(255,255,255,0.28)',
                  },
                }}
              >
                Resolved Complaints
              </Button>
            </Stack>

            {updates && (
              <Button
                onClick={() => {
                  fetchAllSuggestions();
                  setUpdates(false);
                }}
                startIcon={<AutorenewRoundedIcon />}
                sx={{
                  alignSelf: { xs: 'stretch', md: 'center' },
                  borderRadius: 999,
                  px: 2.5,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 800,
                  color: '#4b0f61',
                  bgcolor: '#fff1d3',
                  '&:hover': { bgcolor: '#ffe5af' },
                }}
              >
                Refresh New Updates
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: showComposer ? 'minmax(0, 1.6fr) 420px' : '1fr' }, gap: 3 }}>
        <Box>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((entry) => (
              <SuggestionCard
                key={entry._id}
                user={user}
                suggestions={entry}
                isMobile={isMobile}
              />
            ))
          ) : (
            <Card
              sx={{
                p: 5,
                borderRadius: 6,
                textAlign: 'center',
                border: '1px solid rgba(92, 23, 110, 0.12)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,244,255,0.98) 100%)',
              }}
            >
              <CustomError>No complaints in this section right now.</CustomError>
            </Card>
          )}
        </Box>

        {showComposer && isLaptop && (
          <Box sx={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
            <UserActionsList />
          </Box>
        )}
      </Box>

      {showComposer && !isLaptop && (
        <>
          <Fab
            sx={{
              position: 'fixed',
              right: 20,
              bottom: 20,
              bgcolor: '#5c176e',
              color: '#fff',
              '&:hover': { bgcolor: '#4b0f61' },
            }}
            onClick={() => setIsDrawerOpen((prev) => !prev)}
          >
            {isDrawerOpen ? <CloseIcon /> : <AddIcon />}
          </Fab>
          <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <Box sx={{ width: { xs: '100vw', sm: 460 }, p: 2 }}>
              <UserActionsList isMobile={isMobile} />
            </Box>
          </Drawer>
        </>
      )}
    </Container>
  );
};

export default Suggestions;
