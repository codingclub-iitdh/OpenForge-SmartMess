import * as React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { red } from '@mui/material/colors';
import dayjs from 'dayjs';
import Delete from '@mui/icons-material/Delete';

export default function CommentCard(props) {
  const { canDelete, deleteComment } = props;

  return (
    <Card
      sx={{
        width: '95%',
      }}
      style={{ marginTop: '10px' }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px',
        }}
      >
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: red[500] }} aria-label="recipe" src={`${props?.comments?.userId?.Image}`} />}
          title={props?.comments?.userId?.Username}
          subheader={dayjs(props?.comments?.createdAt).format('DD/MMM/YYYY, ddd')}
          sx={{
            padding: '10px',
          }}
        />
        {canDelete && (
          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              deleteComment(props?.comments?.id);
            }}
          >
            <Delete />
          </Button>
        )}
      </div>

      <CardContent>
        <Typography variant="body1" color="text.secondary" style={{ fontSize: '18px' }}>
          {canDelete
            ? props?.comments?.comment.length > 100
              ? `${props?.comments?.comment.substring(0, 100)}...`
              : props?.comments?.comment
            : props?.comments?.comment}
        </Typography>
      </CardContent>

      {/* {canDelete && props?.suggestions?.status == 'open' && (
        <Button
          style={{ margin: '10px' }}
          color="success"
          variant="outlined"
          onClick={() => markAsresolved(props.suggestions._id)}
        >
          Mark as Resolved
        </Button>
      )} */}
    </Card>
  );
}

CommentCard.propTypes = {
  canDelete: PropTypes.bool,
  deleteComment: PropTypes.func,
  comments: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    comment: PropTypes.string,
    createdAt: PropTypes.string,
    userId: PropTypes.shape({
      Image: PropTypes.string,
      Username: PropTypes.string,
    }),
  }),
};
