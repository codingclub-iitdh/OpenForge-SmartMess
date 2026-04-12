import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import ArrowCircleDownSharpIcon from '@mui/icons-material/ArrowCircleDownSharp';
import ArrowCircleUpSharpIcon from '@mui/icons-material/ArrowCircleUpSharp';
import Delete from '@mui/icons-material/Delete';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import AttachmentOutlinedIcon from '@mui/icons-material/AttachmentOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Modal, Input, message, Upload, Button as AntButton } from 'antd';
import { UploadOutlined } from '@mui/icons-material';
import { voteSuggestion } from '../apis';
import { markAsResolvedAdmin, reopenSuggestionAPI, voteResolutionAPI } from './apis';

const audienceLabels = {
  management: 'Secy & Mess Manager',
  dean: 'SW Office',
  students: 'Students',
};

const containsUserId = (collection = [], userId) =>
  Array.isArray(collection) &&
  collection.some((entry) => String(entry?._id || entry) === String(userId));

const getAudienceBadges = (audience = []) => {
  if (!Array.isArray(audience) || audience.length === 0) {
    return [{ key: 'management', label: 'Secy & Mess Manager' }];
  }

  if (audience.length === 3) {
    return [{ key: 'all', label: 'All' }];
  }

  return audience.map((value) => ({
    key: value,
    label: audienceLabels[value] || value,
  }));
};

export default function SuggestionCard({
  user = {},
  suggestions,
  disable,
  canDelete,
  deleteSuggestion,
  discusson,
  // eslint-disable-next-line no-unused-vars
  isMobile,
}) {
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = React.useState(suggestions?.upvotes || []);
  const [downvotes, setDownvotes] = React.useState(suggestions?.downvotes || []);
  const [expanded, setExpanded] = React.useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = React.useState(false);
  const [resolutionText, setResolutionText] = React.useState('');
  const [resolutionFile, setResolutionFile] = React.useState(null);
  const [submittingResolution, setSubmittingResolution] = React.useState(false);
  const [reopenModalOpen, setReopenModalOpen] = React.useState(false);
  const [reopenText, setReopenText] = React.useState('');
  const [submittingReopen, setSubmittingReopen] = React.useState(false);
  const [resUpvotes, setResUpvotes] = React.useState(suggestions?.resolutionUpvotes || []);
  const [resDownvotes, setResDownvotes] = React.useState(suggestions?.resolutionDownvotes || []);

  const officialResponses = Array.isArray(suggestions?.responseHistory)
    ? [...suggestions.responseHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];
  const audienceBadges = getAudienceBadges(suggestions?.targetAudience);
  const isAuthor = user?._id === suggestions?.userId?._id;
  const isAdminViewer = ['manager', 'admin', 'secy', 'dean'].includes(user?.Role);
  const isVotingDisabled = disable || isAdminViewer;
  const hasUpvoted = containsUserId(upvotes, user?._id);
  const hasDownvoted = containsUserId(downvotes, user?._id);
  const hasApprovedResponse = containsUserId(resUpvotes, user?._id);
  const hasRejectedResponse = containsUserId(resDownvotes, user?._id);
  const latestOfficialResponse = officialResponses[0] || (suggestions?.officialResponse
    ? {
      response: suggestions.officialResponse,
      attachment: suggestions.officialAttachment,
      respondedByRole: suggestions?.resolvedByRole || 'authority',
    }
    : null);

  const handleVote = async (isUpvote) => {
    const res = await voteSuggestion({ upvote: isUpvote, suggestionId: suggestions?._id });
    setUpvotes(res?.data?.upvotes || []);
    setDownvotes(res?.data?.downvotes || []);
  };

  const handleResolutionVote = async (isUpvote) => {
    const res = await voteResolutionAPI({ upvote: isUpvote, suggestionId: suggestions?._id });
    if (res?.data) {
      setResUpvotes(res.data.resolutionUpvotes || []);
      setResDownvotes(res.data.resolutionDownvotes || []);
    }
  };

  const handleResolverSubmit = async () => {
    if (!resolutionText.trim()) {
      message.error('Resolution details are required.');
      return;
    }

    setSubmittingResolution(true);
    const formData = new FormData();
    formData.append('suggestionId', suggestions._id);
    formData.append('response', resolutionText.trim());
    if (resolutionFile) {
      formData.append('image', resolutionFile);
    }

    const res = await markAsResolvedAdmin(formData);
    if (res?.status === 204) {
      message.success('Official response posted successfully.');
      setResolutionModalOpen(false);
      navigate(0);
    } else {
      message.error('Failed to post official response.');
    }
    setSubmittingResolution(false);
  };

  const handleReopenSubmit = async () => {
    if (!reopenText.trim()) {
      message.error('Complaint details are required to reopen.');
      return;
    }

    setSubmittingReopen(true);
    const res = await reopenSuggestionAPI({
      suggestionId: suggestions._id,
      suggestion: reopenText.trim(),
      targetAudience: (suggestions?.targetAudience || []).join(','),
    });

    if (res?.status === 204) {
      message.success('Ticket reopened successfully.');
      setReopenModalOpen(false);
      navigate(0);
    } else {
      message.error('Failed to reopen ticket.');
    }
    setSubmittingReopen(false);
  };

  return (
    <>
      <Card
        sx={{
          width: '100%',
          mt: 2,
          borderRadius: 6,
          overflow: 'hidden',
          border: '1px solid rgba(92, 23, 110, 0.12)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,244,255,0.98) 100%)',
          boxShadow: '0 24px 60px rgba(73, 18, 92, 0.08)',
        }}
      >
        <Box
          sx={{
            p: { xs: 2.2, md: 3 },
            background: 'linear-gradient(135deg, rgba(76, 15, 97, 0.97) 0%, rgba(110, 29, 134, 0.93) 52%, rgba(142, 46, 95, 0.92) 100%)',
            color: '#fff',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={suggestions?.userId?.Image}
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: suggestions?.status === 'open' ? '#ffcc73' : '#f7d9a2',
                  color: '#4b0f61',
                  fontWeight: 800,
                }}
              >
                {suggestions?.userId?.Username?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {suggestions?.userId?.Username}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {dayjs(suggestions?.createdAt).format('DD MMM YYYY, hh:mm A')}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Chip
                label={suggestions?.status === 'open' ? 'Open' : 'Resolved'}
                sx={{
                  bgcolor: '#ffcc73',
                  color: '#4b0f61',
                  fontWeight: 800,
                }}
              />
              {audienceBadges.map((badge) => (
                <Chip
                  key={badge.key}
                  icon={<Groups2OutlinedIcon />}
                  label={badge.label}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    '& .MuiChip-icon': { color: '#ffcc73' },
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Box>

        {suggestions?.image && !discusson && (
          <CardMedia
            component="img"
            height="220"
            src={suggestions.image}
            alt={suggestions.suggestionTitle}
            sx={{ objectFit: 'cover', borderBottom: '1px solid rgba(31, 59, 47, 0.08)' }}
          />
        )}

        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: '#8e2e5f', fontWeight: 800, letterSpacing: 1.2 }}
              >
                {suggestions?.suggestionType || 'Complaint'}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  color: '#4b0f61',
                  fontWeight: 800,
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: { xs: '1.55rem', md: '2rem' },
                }}
              >
                {suggestions?.suggestionTitle}
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: '#4d5a63', lineHeight: 1.9 }}>
              {canDelete && !expanded && suggestions?.suggestion?.length > 170
                ? `${suggestions?.suggestion?.slice(0, 170)}...`
                : suggestions?.suggestion}
            </Typography>

            {canDelete && suggestions?.suggestion?.length > 170 && (
              <Button
                variant="text"
                onClick={() => setExpanded((prev) => !prev)}
                sx={{
                  alignSelf: 'flex-start',
                  p: 0,
                  textTransform: 'none',
                  fontWeight: 700,
                  color: '#6e1d86',
                }}
              >
                {expanded ? 'Show less' : 'Read full complaint'}
              </Button>
            )}

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.2}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  disabled={isVotingDisabled}
                  onClick={() => handleVote(true)}
                  startIcon={<ArrowCircleUpSharpIcon />}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 700,
                    color: hasUpvoted ? '#fff' : '#6e1d86',
                    borderColor: hasUpvoted ? '#6e1d86' : 'rgba(110, 29, 134, 0.28)',
                    bgcolor: hasUpvoted ? '#6e1d86' : 'transparent',
                    '&:hover': {
                      bgcolor: hasUpvoted ? '#5c176e' : 'rgba(110, 29, 134, 0.05)',
                      borderColor: '#6e1d86',
                    },
                  }}
                >
                  {upvotes?.length || 0}
                </Button>
                <Button
                  variant="outlined"
                  disabled={isVotingDisabled}
                  onClick={() => handleVote(false)}
                  startIcon={<ArrowCircleDownSharpIcon />}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 700,
                    color: hasDownvoted ? '#fff' : '#8e2e5f',
                    borderColor: hasDownvoted ? '#8e2e5f' : 'rgba(142, 46, 95, 0.28)',
                    bgcolor: hasDownvoted ? '#8e2e5f' : 'transparent',
                    '&:hover': {
                      bgcolor: hasDownvoted ? '#78284f' : 'rgba(142, 46, 95, 0.05)',
                      borderColor: '#8e2e5f',
                    },
                  }}
                >
                  {downvotes?.length || 0}
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {!discusson && (
                  <Button
                    variant="contained"
                    startIcon={<ForumOutlinedIcon />}
                    onClick={() => navigate(suggestions?._id)}
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #5c176e 0%, #8e2e5f 100%)',
                    }}
                  >
                    {isAdminViewer ? 'View Thread' : 'Join Discussion'}
                  </Button>
                )}

                {isAdminViewer && suggestions?.status === 'open' && (
                  <Button
                    variant="contained"
                    startIcon={<TaskAltOutlinedIcon />}
                    onClick={() => setResolutionModalOpen(true)}
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: '#5c176e',
                      '&:hover': { bgcolor: '#4b0f61' },
                    }}
                  >
                    Post Official Response
                  </Button>
                )}

                {isAuthor && suggestions?.status === 'closed' && (
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltOutlinedIcon />}
                    onClick={() => {
                      setReopenText(suggestions?.suggestion || '');
                      setReopenModalOpen(true);
                    }}
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 700,
                      borderColor: '#8e2e5f',
                      color: '#8e2e5f',
                    }}
                  >
                    Reopen Ticket
                  </Button>
                )}

                {canDelete && (
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => deleteSuggestion(suggestions?._id)}
                    sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}
                  >
                    Delete
                  </Button>
                )}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>

        {latestOfficialResponse && (
          <>
            <Divider />
            <Box sx={{ px: { xs: 2.5, md: 3.5 }, pt: 2.5, pb: officialResponses.length > 0 ? 2.5 : 1.5, bgcolor: 'rgba(92, 23, 110, 0.03)' }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2.2,
                    borderRadius: 4,
                    border: '1px solid rgba(92, 23, 110, 0.12)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,247,233,0.98) 100%)',
                  }}
                >
                  <Stack spacing={1.2}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      spacing={1.2}
                    >
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <VerifiedUserOutlined sx={{ color: '#5c176e' }} />
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: '#5c176e' }}>
                            Authority Responses
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#7a6a86' }}>
                            {officialResponses.length || 1} response{(officialResponses.length || 1) > 1 ? 's' : ''} visible to students
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip label="Visible History" sx={{ bgcolor: '#ffcc73', color: '#4b0f61', fontWeight: 800 }} />
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={isVotingDisabled}
                          onClick={() => handleResolutionVote(true)}
                          startIcon={<ArrowCircleUpSharpIcon />}
                          sx={{
                            borderRadius: 999,
                            textTransform: 'none',
                            fontWeight: 700,
                            color: hasApprovedResponse ? '#fff' : '#6e1d86',
                            borderColor: hasApprovedResponse ? '#6e1d86' : 'rgba(110, 29, 134, 0.28)',
                            bgcolor: hasApprovedResponse ? '#6e1d86' : '#fff',
                          }}
                        >
                          Helpful {resUpvotes?.length || 0}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={isVotingDisabled}
                          onClick={() => handleResolutionVote(false)}
                          startIcon={<ArrowCircleDownSharpIcon />}
                          sx={{
                            borderRadius: 999,
                            textTransform: 'none',
                            fontWeight: 700,
                            color: hasRejectedResponse ? '#fff' : '#8e2e5f',
                            borderColor: hasRejectedResponse ? '#8e2e5f' : 'rgba(142, 46, 95, 0.28)',
                            bgcolor: hasRejectedResponse ? '#8e2e5f' : '#fff',
                          }}
                        >
                          Not Helpful {resDownvotes?.length || 0}
                        </Button>
                      </Stack>
                    </Stack>

                    <Typography
                      variant="body1"
                      sx={{
                        color: '#31414a',
                        lineHeight: 1.9,
                        pl: 1.8,
                        borderLeft: '3px solid #8e2e5f',
                      }}
                    >
                      {latestOfficialResponse?.response}
                    </Typography>

                    {latestOfficialResponse?.attachment && (
                      <Button
                        component="a"
                        href={latestOfficialResponse.attachment}
                        target="_blank"
                        rel="noreferrer"
                        startIcon={<AttachmentOutlinedIcon />}
                        sx={{
                          alignSelf: 'flex-start',
                          textTransform: 'none',
                          fontWeight: 700,
                          color: '#8e2e5f',
                        }}
                      >
                        View authority attachment
                      </Button>
                    )}
                  </Stack>
                </Box>

                {officialResponses.length > 0 && (
                  <Stack spacing={2.2}>
                    {officialResponses.map((entry, index) => (
                      <Box
                        key={`${entry.createdAt}-${index}`}
                        sx={{
                          p: 2.2,
                          borderRadius: 4,
                          border: '1px solid rgba(92, 23, 110, 0.1)',
                          bgcolor: '#fff',
                        }}
                      >
                        <Stack spacing={1.2}>
                          <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={1}
                            justifyContent="space-between"
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#5c176e' }}>
                                {entry?.respondedBy?.Username || 'Administration'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#7a6a86' }}>
                                {entry?.respondedByRole?.toUpperCase()} {' - '}{dayjs(entry?.createdAt).format('DD MMM YYYY, hh:mm A')}
                              </Typography>
                            </Box>
                            {index === 0 && (
                              <Chip
                                label="Latest"
                                sx={{ alignSelf: 'flex-start', bgcolor: '#5c176e', color: '#fff', fontWeight: 700 }}
                              />
                            )}
                          </Stack>

                          <Typography
                            variant="body1"
                            sx={{
                              color: '#31414a',
                              lineHeight: 1.9,
                              pl: 1.8,
                              borderLeft: '3px solid #ffcc73',
                            }}
                          >
                            {entry?.response}
                          </Typography>

                          {entry?.attachment && (
                            <Button
                              component="a"
                              href={entry.attachment}
                              target="_blank"
                              rel="noreferrer"
                              startIcon={<AttachmentOutlinedIcon />}
                              sx={{
                                alignSelf: 'flex-start',
                                textTransform: 'none',
                                fontWeight: 700,
                                color: '#8e2e5f',
                              }}
                            >
                              View attachment
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Box>
          </>
        )}
      </Card>

      <Modal
        title={<Typography sx={{ fontWeight: 800, color: '#5c176e' }}>Post Official Response</Typography>}
        open={resolutionModalOpen}
        onOk={handleResolverSubmit}
        onCancel={() => setResolutionModalOpen(false)}
        confirmLoading={submittingResolution}
        okText="Publish Response"
        okButtonProps={{ style: { background: '#5c176e' } }}
      >
        <Typography variant="body2" sx={{ mb: 2, color: '#61707b' }}>
          This response will be added to the permanent issue timeline and shown to every selected recipient.
        </Typography>

        <Input.TextArea
          rows={5}
          placeholder="Describe the action taken, next steps, or official clarification..."
          value={resolutionText}
          onChange={(e) => setResolutionText(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <Upload
          maxCount={1}
          beforeUpload={(file) => {
            setResolutionFile(file);
            return false;
          }}
          onRemove={() => setResolutionFile(null)}
        >
          <AntButton icon={<UploadOutlined />}>Attach proof or document</AntButton>
        </Upload>
      </Modal>

      <Modal
        title={<Typography sx={{ fontWeight: 800, color: '#7a2f1d' }}>Reopen Ticket</Typography>}
        open={reopenModalOpen}
        onOk={handleReopenSubmit}
        onCancel={() => setReopenModalOpen(false)}
        confirmLoading={submittingReopen}
        okText="Reopen Ticket"
        okButtonProps={{ style: { background: '#7a2f1d' } }}
      >
        <Typography variant="body2" sx={{ mb: 2, color: '#61707b' }}>
          Earlier official responses will remain visible. Add the latest issue details below so the next reviewer has full context.
        </Typography>

        <Input.TextArea
          rows={10}
          value={reopenText}
          onChange={(e) => setReopenText(e.target.value)}
        />
      </Modal>
    </>
  );
}

SuggestionCard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    Username: PropTypes.string,
    Image: PropTypes.string,
  }),
  suggestions: PropTypes.shape({
    _id: PropTypes.string,
    suggestionTitle: PropTypes.string,
    suggestion: PropTypes.string,
    suggestionType: PropTypes.string,
    image: PropTypes.string,
    status: PropTypes.string,
    userId: PropTypes.shape({
      _id: PropTypes.string,
      Username: PropTypes.string,
      Image: PropTypes.string,
    }),
    createdAt: PropTypes.string,
    upvotes: PropTypes.array,
    downvotes: PropTypes.array,
    resolutionUpvotes: PropTypes.array,
    resolutionDownvotes: PropTypes.array,
    responseHistory: PropTypes.array,
    targetAudience: PropTypes.string,
    officialResponse: PropTypes.string,
    officialAttachment: PropTypes.string,
    resolvedByRole: PropTypes.string,
  }),
  disable: PropTypes.bool,
  canDelete: PropTypes.bool,
  deleteSuggestion: PropTypes.func,
  discusson: PropTypes.bool,
  isMobile: PropTypes.bool,
};
