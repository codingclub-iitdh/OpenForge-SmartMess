import * as React from 'react';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CommentForm from './CommentForm';
import { deleteUserSuggestionComment } from './apis';
import { getoneSuggestion } from '../apis';
import CommentCard from './CommentCard';

export default function UserActionsListComment({ Id, isMobile }) {
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openView, setOpenView] = React.useState(false);
  const [comments, setComments] = React.useState([]);
  const suggestionId = Id;
  const [user, setUser] = React.useState({});
  const getUser = async () => {
    let user = await localStorage.getItem('user');
    user = await JSON.parse(user);
    setUser(user);
  };

  useEffect(() => {
    try {
      getUser();
    } catch (error) {
      console.log('getUser error', error);
    }
  }, []);

  const deleteComment = async (commentId) => {
    await deleteUserSuggestionComment({ suggestionId, commentId });
    setComments((comments) => comments.filter((ele) => ele._id !== commentId));
  };

  const fetchUserComments = React.useCallback(async () => {
    const res = await getoneSuggestion(suggestionId);
    setComments(res?.data?.suggestion?.children || []);
  }, [suggestionId]);

  React.useEffect(() => {
    fetchUserComments();
  }, [fetchUserComments]);

  return (
    <List
      sx={{ width: '100%', maxWidth: !isMobile ? 360 : '100%', bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      <ListItemButton
        onClick={() => {
          setOpenAdd(!openAdd);
        }}
      >
        <ListItemIcon
          sx={{
            justifyContent: 'center',
          }}
        >
          <InboxIcon color={openAdd ? 'primary' : undefined} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="h5"
              sx={{ mb: 3, marginTop: 'auto', marginBottom: 'auto' }}
              color={openAdd ? 'primary' : undefined}
            >
              Add a Comment
            </Typography>
          }
        />
        {openAdd ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openAdd} timeout="auto" unmountOnExit>
        <Paper
          elevation={3}
          sx={{
            padding: '20px',
          }}
        >
          <CommentForm Id={suggestionId} />
        </Paper>
      </Collapse>
      <Divider />
      <ListItemButton
        onClick={() => {
          setOpenView(!openView);
        }}
      >
        <ListItemIcon
          sx={{
            justifyContent: 'center',
          }}
        >
          <InboxIcon color={openView ? 'primary' : undefined} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="h5"
              sx={{ mb: 3, marginTop: 'auto', marginBottom: 'auto' }}
              color={openView ? 'primary' : undefined}
            >
              Your Comments
            </Typography>
          }
        />
        {openView ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openView} timeout="auto" unmountOnExit>
        <Paper
          elevation={3}
          sx={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {comments
            .filter((ele) => ele.userId._id === user._id)
            .map((ele) => (
              <CommentCard comments={ele} key={ele._id} canDelete deleteComment={deleteComment} />
            ))}
        </Paper>
      </Collapse>
    </List>
  );
}

UserActionsListComment.propTypes = {
  Id: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
};
