import React, { useCallback, useContext, useState } from 'react';
import { FormControl, TextField, Button, Select, MenuItem, Typography, Box, Card, InputLabel } from '@mui/material';
import { v4 as uuid } from 'uuid';
import { postUserSuggestion } from './apis';
import { toast } from 'react-toastify';
import { SocketContext } from 'src/Context/socket';
import imageCompression from 'browser-image-compression';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import '../index.css';

const SuggestionForm = () => {
  const [suggestion, setSuggestion] = useState({
    title: '',
    suggestion: '',
    image: null,
    suggestionType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socket = useContext(SocketContext);

  const imageCompressOpts = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append('suggestionType', suggestion.suggestionType);
    formData.append('suggestionTitle', suggestion.title);
    formData.append('suggestion', suggestion.suggestion);
    formData.append('suggestionId', uuid());
    if (suggestion.image) {
      try {
        const compressedFile = await imageCompression(suggestion.image, imageCompressOpts);
        formData.append('image', compressedFile);
      } catch (err) {
        console.log(err);
        setSuggestion((suggestion) => ({
          ...suggestion,
          title: '',
          suggestion: '',
          image: null,
          suggestionType: '',
        }));
        setIsSubmitting(false);
        toast.error('Error in image compression.');
        return;
      }
    }
    const res = await postUserSuggestion(formData);
    if (res.status === 200) {
      toast.success('Ticket Submitted Successfully');
      setSuggestion({
        title: '',
        suggestion: '',
        image: null,
        suggestionType: '',
      });
      document.getElementById('image-upload').value = null;
      socket.emit('new-post');
    } else {
      toast.error('Some Error Occured');
    }
    setIsSubmitting(false);
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        p: 4, 
        borderRadius: 4, 
        border: '1px solid rgba(108,27,133,0.1)',
        bgcolor: '#ffffff',
        boxShadow: '0 8px 32px rgba(46, 8, 69, 0.08)' 
      }}
    >
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 800, color: '#2E0845', fontFamily: "'DM Serif Display', serif" }}>
        Launch a New Ticket
      </Typography>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <FormControl fullWidth>
          <InputLabel id="suggestion-type-label" sx={{ color: '#2E0845', fontWeight: 600 }}>Category</InputLabel>
          <Select
            labelId="suggestion-type-label"
            value={suggestion.suggestionType}
            label="Category"
            required
            onChange={(e) => setSuggestion({ ...suggestion, suggestionType: e.target.value })}
            sx={{
              borderRadius: 3,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffad4a', strokeWidth: 2 },
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
          <TextField
            placeholder="A brief summary of the issue..."
            label="Ticket Title"
            required
            variant="outlined"
            value={suggestion?.title}
            onChange={(e) => setSuggestion({ ...suggestion, title: e.target.value })}
            InputProps={{
               sx: { borderRadius: 3 }
            }}
            sx={{
               '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffad4a' },
               '& .MuiInputLabel-root.Mui-focused': { color: '#ffad4a' }
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
            value={suggestion?.suggestion}
            onChange={(e) => setSuggestion({ ...suggestion, suggestion: e.target.value })}
            InputProps={{
               sx: { borderRadius: 3, p: 2 }
            }}
            sx={{
               '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffad4a' },
               '& .MuiInputLabel-root.Mui-focused': { color: '#ffad4a' }
            }}
          />
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ 
                borderRadius: 3, 
                textTransform: 'none', 
                fontWeight: 600, 
                color: '#2E0845', 
                borderColor: 'rgba(46,8,69,0.2)',
                '&:hover': { borderColor: '#2E0845', bgcolor: 'rgba(46,8,69,0.04)' }
            }}
          >
            Upload Evidence (Optional)
            <input
              id="image-upload"
              type="file"
              hidden
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setSuggestion({ ...suggestion, image: e.target.files[0] })}
            />
          </Button>
          {suggestion.image && (
             <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
               {suggestion.image.name} Attached
             </Typography>
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            py: 1.5,
            mt: 1,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            bgcolor: '#2E0845',
            color: 'white',
            boxShadow: '0 4px 14px rgba(46,8,69,0.4)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: '#ffad4a',
              color: '#2E0845',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(255,173,74,0.4)',
            }
          }}
        >
          {isSubmitting ? 'Uploading Data...' : 'Submit Official Ticket'}
        </Button>
      </form>
    </Card>
  );
};

export default SuggestionForm;
