import * as React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Card, Divider, Stack, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SuggestionForm from './SuggestionForm';
import SuggestionCard from './SuggestionCards';
import { deleteUserSuggestion, getUserSuggestion } from './apis';
import { SocketContext } from '../../../Context/socket';

export default function UserActionsList({ isMobile }) {
  const [suggestions, setSuggestions] = React.useState([]);
  const [user, setUser] = React.useState({});
  const [openComposer, setOpenComposer] = React.useState(true);
  const [openTickets, setOpenTickets] = React.useState(false);
  const socket = React.useContext(SocketContext);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('error');
    }
  }, []);

  const deleteSuggestion = async (suggestionId) => {
    const res = await deleteUserSuggestion({ suggestionId });
    setSuggestions((current) => current.filter((entry) => entry._id !== suggestionId));
    if (res?.data?.deletedSuggestion) {
      socket.emit('delete-suggestion', res.data.deletedSuggestion);
    }
  };

  const fetchUserSuggestions = React.useCallback(async () => {
    const res = await getUserSuggestion();
    setSuggestions(res?.data?.suggestions || []);
  }, []);

  React.useEffect(() => {
    fetchUserSuggestions();
  }, [fetchUserSuggestions]);

  React.useEffect(() => {
    const refresh = () => fetchUserSuggestions();
    socket.on('new-post', refresh);
    return () => socket.off('new-post', refresh);
  }, [socket, fetchUserSuggestions]);

  return (
    <Stack spacing={2.5}>
      <Accordion
        expanded={openComposer}
        onChange={() => setOpenComposer((prev) => !prev)}
        disableGutters
        elevation={0}
        sx={{
          borderRadius: '24px !important',
          overflow: 'hidden',
          border: '1px solid rgba(92, 23, 110, 0.12)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,244,255,0.98) 100%)',
          boxShadow: '0 20px 44px rgba(73, 18, 92, 0.08)',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#5c176e' }} />}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#5c176e', fontFamily: "'DM Serif Display', serif" }}>
              New Complaint
            </Typography>
            <Typography variant="body2" sx={{ color: '#7a6a86' }}>
              Open only when you want to file a ticket
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <SuggestionForm onSubmitted={fetchUserSuggestions} />
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={openTickets}
        onChange={() => setOpenTickets((prev) => !prev)}
        disableGutters
        elevation={0}
        sx={{
          borderRadius: '24px !important',
          overflow: 'hidden',
          border: '1px solid rgba(92, 23, 110, 0.12)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,244,255,0.98) 100%)',
          boxShadow: '0 20px 44px rgba(73, 18, 92, 0.08)',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#5c176e' }} />}>
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pr: 1 }}>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: '#5c176e', fontFamily: "'DM Serif Display', serif" }}
                >
                  Your Tickets
                </Typography>
                <Typography variant="body2" sx={{ color: '#7a6a86', lineHeight: 1.8 }}>
                  Expand only when you want to review your own complaints
                </Typography>
              </Box>
              <Box
                sx={{
                  minWidth: 34,
                  height: 34,
                  px: 1.2,
                  borderRadius: 99,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: '#ffcc73',
                  color: '#4b0f61',
                  fontWeight: 800,
                }}
              >
                {suggestions.length}
              </Box>
            </Stack>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={2}>
            {suggestions.length > 0 ? (
              suggestions.map((entry) => (
                <SuggestionCard
                  key={entry._id}
                  user={user}
                  suggestions={entry}
                  disable
                  canDelete
                  isMobile={isMobile}
                  deleteSuggestion={deleteSuggestion}
                />
              ))
            ) : (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 4,
                  textAlign: 'center',
                  bgcolor: 'rgba(92, 23, 110, 0.04)',
                  color: '#7a6a86',
                }}
              >
                No personal tickets yet.
              </Box>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
