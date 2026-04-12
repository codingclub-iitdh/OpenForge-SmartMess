import React, { useCallback, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  TextField,
  Button,
  Select,
  MenuItem,
  Typography,
  Box,
  Card,
  InputLabel,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Chip,
  Stack,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import imageCompression from 'browser-image-compression';
import { SocketContext } from '../../../Context/socket';
import { postUserSuggestion } from './apis';
import '../index.css';

const audienceOptions = [
  { value: 'management', label: 'Secy & Mess Manager' },
  { value: 'dean', label: 'Dean SW' },
  { value: 'students', label: 'Students' },
];

const defaultAudience = ['management'];

const SuggestionForm = ({ initialAudience = defaultAudience, onSubmitted }) => {
  const [suggestion, setSuggestion] = useState({
    title: '',
    suggestion: '',
    image: null,
    suggestionType: '',
    targetAudience: initialAudience,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // console.log("Socket connected:", socket?.id);
  }, [socket]);

  const imageCompressOpts = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  const resetForm = useCallback(() => {
    setSuggestion({
      title: '',
      suggestion: '',
      image: null,
      suggestionType: '',
      targetAudience: initialAudience,
    });
    const uploadInput = document.getElementById('image-upload');
    if (uploadInput) {
      uploadInput.value = null;
    }
  }, [initialAudience]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('suggestionType', suggestion.suggestionType);
    formData.append('suggestionTitle', suggestion.title);
    formData.append('suggestion', suggestion.suggestion);
    formData.append('suggestionId', uuid());
    formData.append('targetAudience', suggestion.targetAudience.join(','));

    if (suggestion.image) {
      try {
        const compressedFile = await imageCompression(suggestion.image, imageCompressOpts);
        formData.append('image', compressedFile);
      } catch (err) {
        console.log(err);
        resetForm();
        setIsSubmitting(false);
        toast.error('Error in image compression.');
        return;
      }
    }

    const res = await postUserSuggestion(formData);
    if (res?.status === 200) {
      toast.success('Ticket submitted successfully');
      resetForm();
      socket.emit('new-post');
      if (onSubmitted) {
        onSubmitted();
      }
    } else {
      toast.error('Some error occurred');
    }

    setIsSubmitting(false);
  };

  const audienceSummary =
    suggestion.targetAudience.length === audienceOptions.length
      ? 'All'
      : audienceOptions
          .filter((option) => suggestion.targetAudience.includes(option.value))
          .map((option) => option.label)
          .join(', ');

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 6,
        border: '1px solid rgba(92, 23, 110, 0.14)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,244,255,0.98) 100%)',
        boxShadow: '0 24px 60px rgba(73, 18, 92, 0.08)',
      }}
    >
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #6e1d86 0%, #8e2e5f 100%)',
            boxShadow: '0 12px 24px rgba(110, 29, 134, 0.25)',
          }}
        >
          <CampaignOutlinedIcon />
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: '#5c176e', fontFamily: "'DM Serif Display', serif" }}
        >
          Raise a Complaint
        </Typography>
        <Typography variant="body2" sx={{ color: '#58656f', lineHeight: 1.8 }}>
          Choose who should receive this message, explain the issue clearly, and attach proof if it helps.
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <FormControl fullWidth>
          <InputLabel id="suggestion-type-label" sx={{ fontWeight: 600 }}>
            Category
          </InputLabel>
          <Select
            labelId="suggestion-type-label"
            value={suggestion.suggestionType}
            label="Category"
            required
            onChange={(e) => setSuggestion({ ...suggestion, suggestionType: e.target.value })}
            sx={{
              borderRadius: 4,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6e1d86' },
            }}
          >
            <MenuItem value="improvement">Mess Improvement</MenuItem>
            <MenuItem value="new-food-item">New Food Proposal</MenuItem>
            <MenuItem value="hygiene">Hygiene / Sanitation</MenuItem>
            <MenuItem value="contamination">Food Contamination</MenuItem>
            <MenuItem value="other">Other Inquiry</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="audience-label" sx={{ fontWeight: 600 }}>
            Send To
          </InputLabel>
          <Select
            labelId="audience-label"
            multiple
            value={suggestion.targetAudience}
            input={<OutlinedInput label="Send To" />}
            onChange={(e) => setSuggestion({ ...suggestion, targetAudience: e.target.value })}
            renderValue={(selected) =>
              selected.length === audienceOptions.length
                ? 'All'
                : audienceOptions
                    .filter((option) => selected.includes(option.value))
                    .map((option) => option.label)
                    .join(', ')
            }
            sx={{
              borderRadius: 4,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6e1d86' },
            }}
          >
            {audienceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={suggestion.targetAudience.includes(option.value)} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {(suggestion.targetAudience.length === audienceOptions.length
            ? [{ value: 'all', label: 'All' }]
            : audienceOptions.filter((option) => suggestion.targetAudience.includes(option.value))
          ).map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              sx={{
                bgcolor: option.value === 'all' ? '#5c176e' : 'rgba(92, 23, 110, 0.08)',
                color: option.value === 'all' ? '#fff' : '#6e1d86',
                fontWeight: 700,
              }}
            />
          ))}
        </Box>

        <FormControl fullWidth>
          <TextField
            placeholder="A brief summary of the issue..."
            label="Ticket Title"
            required
            variant="outlined"
            value={suggestion.title}
            onChange={(e) => setSuggestion({ ...suggestion, title: e.target.value })}
            InputProps={{ sx: { borderRadius: 4 } }}
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6e1d86',
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#6e1d86' },
            }}
          />
        </FormControl>

        <FormControl fullWidth>
          <TextField
            label="Description"
            placeholder="Describe the complaint in full detail..."
            required
            variant="outlined"
            multiline
            minRows={6}
            value={suggestion.suggestion}
            onChange={(e) => setSuggestion({ ...suggestion, suggestion: e.target.value })}
            InputProps={{ sx: { borderRadius: 4, p: 1 } }}
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6e1d86',
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#6e1d86' },
            }}
          />
        </FormControl>

        <Accordion
          disableGutters
          elevation={0}
          sx={{
            borderRadius: '18px !important',
            overflow: 'hidden',
            border: '1px solid rgba(92, 23, 110, 0.12)',
            background: 'rgba(249, 241, 255, 0.82)',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#5c176e' }} />}>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#5c176e' }}>More Options</Typography>
              <Typography variant="body2" sx={{ color: '#7a6a86' }}>
                Target summary and evidence upload
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 4,
                  background: 'rgba(92, 23, 110, 0.05)',
                  border: '1px dashed rgba(92, 23, 110, 0.18)',
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', color: '#58656f', mb: 1 }}>
                  Message target
                </Typography>
                <Typography variant="body2" sx={{ color: '#5c176e', fontWeight: 700 }}>
                  This complaint will be visible to: {audienceSummary || 'Secy & Mess Manager'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    borderRadius: 4,
                    textTransform: 'none',
                    fontWeight: 700,
                    color: '#5c176e',
                    borderColor: 'rgba(92, 23, 110, 0.22)',
                    '&:hover': { borderColor: '#5c176e', bgcolor: 'rgba(92, 23, 110, 0.05)' },
                  }}
                >
                  Upload Evidence
                  <input
                    id="image-upload"
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => setSuggestion({ ...suggestion, image: e.target.files?.[0] || null })}
                  />
                </Button>
                {suggestion.image && (
                  <Typography variant="body2" sx={{ color: '#8e2e5f', fontWeight: 600 }}>
                    {suggestion.image.name} attached
                  </Typography>
                )}
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || suggestion.targetAudience.length === 0}
          sx={{
            py: 1.7,
            mt: 1,
            borderRadius: 4,
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #5c176e 0%, #8e2e5f 100%)',
            color: '#fff',
            boxShadow: '0 16px 32px rgba(92, 23, 110, 0.22)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4b0f61 0%, #78284f 100%)',
            },
          }}
        >
          {isSubmitting ? 'Submitting Complaint...' : 'Submit Complaint'}
        </Button>
      </form>
    </Card>
  );
};

SuggestionForm.propTypes = {
  initialAudience: PropTypes.array,
  onSubmitted: PropTypes.func,
};

export default SuggestionForm;
