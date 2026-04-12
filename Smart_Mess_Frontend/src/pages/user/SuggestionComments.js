import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container, Drawer, Fab, Stack, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from 'react-router-dom';
import SuggestionCard from './Suggestions/SuggestionCards';
import UserActionsListComment from './Suggestions/UserActionListComment';
import { getoneSuggestion } from './apis';
import CustomError from '../CustomErrorMessage';
import CommentCard from './Suggestions/CommentCard';

const SuggestionComment = () => {
  const { suggestionId } = useParams();
  const [suggestionComment, setSuggestionComment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState({});
  const isLaptop = useMediaQuery('(min-width:1024px)');
  const isMobile = useMediaQuery('(max-width:640px)');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('error fetching user');
    }
  }, []);

  const fetchSuggestion = useCallback(async () => {
    const res = await getoneSuggestion(suggestionId);
    setSuggestionComment(res?.data?.suggestion || null);
  }, [suggestionId]);

  useEffect(() => {
    fetchSuggestion();
  }, [fetchSuggestion]);

  const showCommentComposer = !['manager', 'admin', 'secy', 'dean'].includes(user?.Role);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: '#1f3b2f', fontFamily: "'DM Serif Display', serif" }}
          >
            Complaint Thread
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: '#61707b', lineHeight: 1.8 }}>
            Read the complaint thread, review all authority responses, and follow the public discussion around this complaint.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: showCommentComposer ? 'minmax(0, 1.6fr) 380px' : '1fr' }, gap: 3 }}>
          <Stack spacing={2}>
            {suggestionComment ? (
              <>
                <SuggestionCard user={user} suggestions={suggestionComment} discusson isMobile={isMobile} />
                {suggestionComment.children?.length > 0 ? (
                  suggestionComment.children.map((entry) => (
                    <CommentCard comments={entry} key={entry._id || entry.id} />
                  ))
                ) : (
                  <CustomError>No comments yet.</CustomError>
                )}
              </>
            ) : (
              <CustomError>No complaint found.</CustomError>
            )}
          </Stack>

          {showCommentComposer && isLaptop && (
            <Box sx={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
              <UserActionsListComment Id={suggestionId} />
            </Box>
          )}
        </Box>
      </Stack>

      {showCommentComposer && !isLaptop && (
        <>
          <Fab
            sx={{
              position: 'fixed',
              right: 20,
              bottom: 20,
              bgcolor: '#1f3b2f',
              color: '#fff',
              '&:hover': { bgcolor: '#173026' },
            }}
            onClick={() => setIsDrawerOpen((prev) => !prev)}
          >
            {isDrawerOpen ? <CloseIcon /> : <AddIcon />}
          </Fab>
          <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 2 }}>
              <UserActionsListComment Id={suggestionId} />
            </Box>
          </Drawer>
        </>
      )}
    </Container>
  );
};

export default SuggestionComment;
