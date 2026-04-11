import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import ArrowCircleUpSharpIcon from '@mui/icons-material/ArrowCircleUpSharp';
import ArrowCircleDownSharpIcon from '@mui/icons-material/ArrowCircleDownSharp';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { red, green } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import { voteSuggestion } from '../apis';
import Delete from '@mui/icons-material/Delete';
import { markAsresolved, markAsResolvedAdmin, reopenSuggestionAPI, voteResolutionAPI } from './apis';
import { SocketContext } from 'src/Context/socket';
import { Modal, Input, message, Upload, Button as AntButton } from 'antd';
import { UploadOutlined, VerifiedUserOutlined } from '@mui/icons-material';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function SuggestionCard(props) {
  const { isMobile } = props;
  const [expanded, setExpanded] = React.useState(false);
  const { setVote, disable, canDelete, deleteSuggestion, discusson, suggestions } = props;
  const [upvotes, setUpvotes] = useState(suggestions?.upvotes || props?.suggestions?.suggestion?.upvotes);
  const [downvotes, setDownvotes] = useState(suggestions?.downvotes || props?.suggestions?.suggestion?.downvotes);
  const suggestionid = props.key;
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const navigate = useNavigate();
  const handleClick = async (isUpvote, suggestionId) => {
    const res = await voteSuggestion({ upvote: isUpvote, suggestionId });
    setUpvotes(res.data.upvotes);
    setDownvotes(res.data.downvotes);
  };
  const handleCardClick = () => {
    navigate(props?.suggestions?._id);
  };
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  
  // Official Resolution Modal State
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionText, setResolutionText] = useState("");
  const [resolutionFile, setResolutionFile] = useState(null);
  const [submittingResolution, setSubmittingResolution] = useState(false);
  
  // Reopen Modal State
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenText, setReopenText] = useState("");
  const [submittingReopen, setSubmittingReopen] = useState(false);

  // Resolution Vote State
  const [resUpvotes, setResUpvotes] = useState(props?.suggestions?.resolutionUpvotes || []);
  const [resDownvotes, setResDownvotes] = useState(props?.suggestions?.resolutionDownvotes || []);

  const handleResolutionVote = async (isUpvote) => {
    const res = await voteResolutionAPI({ upvote: isUpvote, suggestionId: props?.suggestions?._id });
    if (res && res.data) {
       setResUpvotes(res.data.resolutionUpvotes);
       setResDownvotes(res.data.resolutionDownvotes);
    }
  };

  const isAuthor = props?.user?._id === props?.suggestions?.userId?._id;
  const isVotingDisabled = disable || ['manager', 'admin', 'secy', 'dean'].includes(props?.user?.Role);

  const handleResolverSubmit = async () => {
    if (!resolutionText) {
      message.error("Resolution Action Details are required!");
      return;
    }
    setSubmittingResolution(true);
    let formData = new FormData();
    formData.append("suggestionId", props.suggestions._id);
    formData.append("response", resolutionText);
    if (resolutionFile) {
      formData.append("image", resolutionFile);
    }
    
    const res = await markAsResolvedAdmin(formData);
    if (res && res.status === 204) {
       message.success("Issue successfully officially resolved.");
       setResolutionModalOpen(false);
       navigate(0); // Quick refresh to poll closed state
    } else {
       message.error("Failed to commit resolution");
    }
    setSubmittingResolution(false);
  };

  const handleReopenSubmit = async () => {
    if (!reopenText) {
      message.error("Complaint body is required to reopen!");
      return;
    }
    setSubmittingReopen(true);
    const res = await reopenSuggestionAPI({ suggestionId: props.suggestions._id, suggestion: reopenText });
    if (res && res.status === 204) {
       message.success("Ticket Successfully Reopened!");
       setReopenModalOpen(false);
       navigate(0); // Poll fresh updates
    } else {
       message.error("Failed to reopen ticket.");
    }
    setSubmittingReopen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Card
      sx={{
        width: !isMobile ? '95%' : '100%',
        mt: 2,
        borderRadius: 3,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        border: '1px solid rgba(108,27,133,0.1)',
        transition: 'transform 0.2s',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(108,27,133,0.12)'
        }
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: !isMobile ? '6px 16px' : '4px 8px',
          borderBottom: '1px solid rgba(0,0,0,0.04)'
        }}
      >
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: props?.suggestions?.status === 'open' ? '#ffad4a' : '#4CAF50', color: props?.suggestions?.status === 'open' ? '#2E0845' : 'white', fontWeight: 800 }} aria-label="recipe" src={props?.suggestions?.userId?.Image}>{props?.suggestions?.userId?.Username?.charAt(0)?.toUpperCase()} </Avatar>}
          title={
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{props?.suggestions?.userId?.Username}</Typography>
          }
          subheader={dayjs(props?.suggestions?.createdAt).format('DD MMM YYYY, hh:mm A')}
          sx={{
            padding: '10px 0',
            flex: 1
          }}
          subheaderTypographyProps={{ fontSize: '12px', color: 'text.secondary' }}
          action={
              <Chip 
                  label={props?.suggestions?.status?.toUpperCase()} 
                  size="small"
                  sx={{ 
                      ml: 2, mt: 1, 
                      fontWeight: 800, 
                      fontSize: '0.7rem',
                      color: props?.suggestions?.status === 'open' ? '#2E0845' : '#fff',
                      bgcolor: props?.suggestions?.status === 'open' ? '#ffad4a' : '#4CAF50'
                  }} 
              />
          }
        />
        {canDelete && (
          <Button
            color="error"
            variant="text"
            sx={{ mt: 1 }}
            onClick={() => {
              deleteSuggestion(props?.suggestions?._id);
            }}
          >
            <Delete />
          </Button>
        )}
      </div>
      {console.log(props.suggestions?.image)}
      {!props.iscomment && props.suggestions?.image && (
        <CardMedia
          component="img"
          height="200px"
          src={props.suggestions.image}
          alt="Paella dish"
          sx={{
            objectFit: 'contain',
            background: 'inherit',
          }}
        />
      )}

      <CardContent sx={{ pt: 3 }}>
        <Typography variant="h5" color="text.primary" sx={{ fontWeight: 800, color: '#2E0845', mb: 2, fontFamily: "'DM Serif Display', serif" }}>
          {props?.suggestions?.suggestionTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {canDelete
            ? props?.suggestions?.suggestion?.substring(0, Math.min(100, props?.suggestions?.suggestion?.length))
            : props?.suggestions?.suggestion}

          {props?.comments?.comment}
          {canDelete && props?.suggestions?.suggestion?.length > 100 && <>...</>}
        </Typography>
      </CardContent>
      {!canDelete && (
        <CardActions
          disableSpacing
          style={
            isDesktop
              ? { display: 'flex', justifyContent: 'space-between' }
              : { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: '10px' }
          }
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outlined"
              size="small"
              sx={{ color: '#4CAF50', borderColor: 'rgba(76, 175, 80, 0.5)', borderRadius: 4, px: 2, '&:hover': !isVotingDisabled ? { bgcolor: 'rgba(76,175,80,0.1)' } : {} }}
              disabled={isVotingDisabled}
              onClick={() => {
                handleClick(true, props?.suggestions?._id);
              }}
              startIcon={<ArrowCircleUpSharpIcon />}
            >
              <Typography sx={{ fontWeight: 700 }}>{upvotes?.length}</Typography>
            </Button>

            <Button
              variant="outlined"
              size="small"
              sx={{ color: '#f44336', borderColor: 'rgba(244, 67, 54, 0.5)', borderRadius: 4, px: 2, '&:hover': !isVotingDisabled ? { bgcolor: 'rgba(244,67,54,0.1)' } : {} }}
              disabled={isVotingDisabled}
              onClick={() => {
                handleClick(false, props?.suggestions?._id);
              }}
              startIcon={<ArrowCircleDownSharpIcon />}
            >
              <Typography sx={{ fontWeight: 700 }}>{downvotes?.length}</Typography>
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             {!props.discusson && (
               <Button variant="contained" size="small" sx={{ bgcolor: '#6c1b85', '&:hover': {bgcolor: '#4A0E6B'}, borderRadius: 4, textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none' }} onClick={handleCardClick}>
                 {isVotingDisabled ? 'View Discussion' : 'Join Discussion'}
               </Button>
             )}
             
             {isVotingDisabled && props?.suggestions?.status === 'open' && (
               <Button
                 size="small"
                 sx={{ borderRadius: 4, textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none' }}
                 color="success"
                 variant="contained"
                 onClick={() => setResolutionModalOpen(true)}
               >
                 Resolve Issue
               </Button>
             )}

             {isAuthor && props?.suggestions?.status === 'closed' && (
               <Button
                 size="small"
                 sx={{ borderRadius: 4, textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none' }}
                 color="warning"
                 variant="contained"
                 onClick={() => {
                     setReopenText(props.suggestions.suggestion);
                     setReopenModalOpen(true);
                 }}
               >
                 Reopen Ticket
               </Button>
             )}
          </div>

          {canDelete && props?.suggestions?.suggestion?.length > 100 && (
            <ExpandMore expand={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
              <ExpandMoreIcon />
            </ExpandMore>
          )}
        </CardActions>
      )}

      {/* RENDER THE RESOLUTION IF IT EXISTS (Persist even if reopened) */}
      {props?.suggestions?.officialResponse && (
         <CardContent sx={{ bgcolor: 'rgba(76,175,80,0.05)', borderTop: '1px solid rgba(76,175,80,0.1)', mt: 1 }}>
            <Typography variant="overline" sx={{ color: '#4CAF50', fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <VerifiedUserOutlined fontSize="small" />
                 Official Resolution Statement
               </div>
               
               <div style={{ display: 'flex', gap: '4px' }}>
                 <Button
                   variant="outlined"
                   size="small"
                   sx={{ minWidth: '40px', color: '#4CAF50', borderColor: 'rgba(76, 175, 80, 0.5)', borderRadius: 2, px: 1, py: 0 }}
                   disabled={isVotingDisabled}
                   onClick={() => handleResolutionVote(true)}
                 >
                   <ArrowCircleUpSharpIcon sx={{ fontSize: '18px', mr: 0.5 }} />
                   <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{resUpvotes?.length || 0}</Typography>
                 </Button>
                 <Button
                   variant="outlined"
                   size="small"
                   sx={{ minWidth: '40px', color: '#f44336', borderColor: 'rgba(244, 67, 54, 0.5)', borderRadius: 2, px: 1, py: 0 }}
                   disabled={isVotingDisabled}
                   onClick={() => handleResolutionVote(false)}
                 >
                   <ArrowCircleDownSharpIcon sx={{ fontSize: '18px', mr: 0.5 }} />
                   <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{resDownvotes?.length || 0}</Typography>
                 </Button>
               </div>
            </Typography>
            <Typography variant="body2" sx={{ color: '#2E0845', fontWeight: 500, fontStyle: 'italic', pl: 2, borderLeft: '3px solid #4CAF50' }}>
               "{props?.suggestions?.officialResponse}"
            </Typography>
            {props?.suggestions?.officialAttachment && (
               <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 2, borderRadius: 2 }} 
                  href={props.suggestions.officialAttachment} 
                  target="_blank"
               >
                  View Attachment
               </Button>
            )}
         </CardContent>
      )}

      {props?.suggestions?.suggestion?.length > 100 && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>{props.suggestions?.suggestion}</Typography>
          </CardContent>
        </Collapse>
      )}
      
      {/* OFFICIAL RESOLVING MODAL */}
      <Modal
         title={<Typography sx={{ fontWeight: 800, color: '#4CAF50' }}>Submit Official Resolution</Typography>}
         open={resolutionModalOpen}
         onOk={handleResolverSubmit}
         onCancel={() => setResolutionModalOpen(false)}
         confirmLoading={submittingResolution}
         okText="Close Issue & Notify"
         okButtonProps={{ style: { background: '#4CAF50' } }}
      >
         <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Provide the administrative action taken to resolve this ticket. This statement will be permanently attached to the issue for transparency.
         </Typography>
         
         <Input.TextArea 
            rows={4}
            placeholder="Describe the action taken to resolve this issue..." 
            value={resolutionText}
            onChange={(e) => setResolutionText(e.target.value)}
            style={{ marginBottom: '16px' }}
         />
         
         <Upload 
            maxCount={1}
            beforeUpload={(file) => {
               setResolutionFile(file);
               return false; // Prevent auto-upload immediately
            }}
            onRemove={() => setResolutionFile(null)}
         >
            <AntButton icon={<UploadOutlined />}>Attach Proof/Document (Optional)</AntButton>
         </Upload>
      </Modal>

      {/* REOPEN TICKET MODAL */}
      <Modal
         title={<Typography sx={{ fontWeight: 800, color: '#ffad4a' }}>Reopen Ticket</Typography>}
         open={reopenModalOpen}
         onOk={handleReopenSubmit}
         onCancel={() => setReopenModalOpen(false)}
         confirmLoading={submittingReopen}
         okText="Reopen & Notify Admins"
         okButtonProps={{ style: { background: '#2E0845' } }}
      >
         <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            The previous resolution will remain attached as a historical record. Please update or append your original complaint below to explain what happened.
         </Typography>
         
         <Input.TextArea 
            rows={10}
            value={reopenText}
            onChange={(e) => setReopenText(e.target.value)}
            style={{ marginBottom: '16px' }}
         />
      </Modal>

    </Card>
  );
}
