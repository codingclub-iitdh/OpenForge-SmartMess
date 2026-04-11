import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardMedia,
  Typography,
  Rating,
  FormControl,
  TextField,
  Button,
  useMediaQuery,
} from '@mui/material';
import { getFoodReviews } from '../../../utils/apis';

const FoodRatingCard = ({ item, ratings, setRatedFoodItems, ratedItem, isReturn, navigate }) => {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const isLargeMobile = useMediaQuery('(max-width:450px)');

  useEffect(() => {
    // Only load from ratedItem if we aren't currently in an active editing session
    // to prevent background props updates from wiping out user's unsaved changes
    if (ratedItem && !isEditing) {
      setRating(ratedItem.rating || 0);
      setComments(ratedItem.review || '');
    } else if (!ratedItem) {
        setRating(parseInt(ratings?.Rating, 10) || 0);
    }
  }, [ratedItem, ratings, isEditing]);

  const handleEditToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Step 1: Give Numerical Rating
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/user/dashboard/giveRating`,
        { foodId: item?._id, rating },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Step 2: Submit Text Review (Note: use 'comments' for the payload as expected by current backend handler)
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/user/dashboard/submitFoodReview`,
        { id: item?._id, value: rating, comments },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Refresh listings
      const updatedReviews = await getFoodReviews();
      if (updatedReviews?.length > 0) {
        setRatedFoodItems(updatedReviews);
      }
      setIsEditing(false);

      if (isReturn) {
        navigate('/dashboard/app');
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: !isLargeMobile ? '240px' : '100%',
        maxWidth: '300px',
        alignItems: 'center',
        padding: '24px 16px',
        margin: '12px',
        borderRadius: 4,
        boxShadow: ratedItem ? 'none' : '0 12px 24px -4px rgba(108,27,133,0.1)',
        border: ratedItem ? '1px dashed rgba(145, 158, 171, 0.4)' : '1px solid rgba(108,27,133,0.05)',
        background: ratedItem ? '#f9fafb' : 'white',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: !ratedItem ? 'translateY(-6px)' : 'none',
            boxShadow: !ratedItem ? '0 15px 30px -5px rgba(108,27,133,0.15)' : 'none'
        }
      }}
    >
      <CardMedia
        image={item?.Image}
        component="img"
        sx={{
          borderRadius: '50%',
          height: '100px',
          width: '100px',
          objectFit: 'cover',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          mb: 2,
          border: '3px solid white',
          background: '#f4f6f8'
        }}
        loading="lazy"
      />
      
      <Typography variant="h6" component="p" textAlign="center" sx={{ fontWeight: 800, color: '#2E0845', fontFamily: "'DM Serif Display', serif", lineHeight: 1.2, mb: 0.5 }}>
        {item?.Name?.length > 18 ? item?.Name?.slice(0, 18) + '...' : item?.Name}
      </Typography>
      
      <Typography variant="caption" component="p" textAlign="center" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2 }}>
        {ratings ? `Avg: ${parseFloat(ratings?.Rating).toFixed(1)} ★` : 'No Ratings Yet'}
      </Typography>
      
      <form
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          width: '100%'
        }}
        onSubmit={handleSubmit}
      >
        <FormControl required sx={{ mb: 2 }}>
          <Rating
            value={rating}
            name="rating"
            onChange={(event, newValue) => setRating(newValue)}
            precision={0.5}
            disabled={(!!ratedItem && !isEditing) || isSubmitting}
            sx={{ color: '#ffad4a', fontSize: '2rem' }}
          />
        </FormControl>
        
        <FormControl required sx={{ width: '100%', mb: 2 }}>
          <TextField
            placeholder="How was the food today?"
            multiline
            rows={3}
            name="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={(!!ratedItem && !isEditing) || isSubmitting}
            variant="outlined"
            InputProps={{ 
                sx: { borderRadius: 2, fontSize: '0.875rem', bgcolor: (ratedItem && !isEditing) ? 'transparent' : '#f8f9fa' } 
            }}
          />
        </FormControl>

        {(!ratedItem || isEditing) ? (
          <Button 
              type="submit" 
              variant="contained"
              disabled={isSubmitting || !rating}
              fullWidth
              sx={{ bgcolor: '#6c1b85', '&:hover': {bgcolor: '#4A0E6B'}, fontWeight: 700, borderRadius: 2, py: 1.2, boxShadow: 'none' }}
          >
              {isSubmitting ? 'Posting...' : isEditing ? 'Update Review' : 'Submit Review'}
          </Button>
        ) : (
          <Button 
              type="button" 
              variant="outlined" 
              fullWidth
              onClick={handleEditToggle}
              sx={{ borderRadius: 2, py: 1.2, fontWeight: 700, borderColor: '#6c1b85', color: '#6c1b85', '&:hover': { borderColor: '#4A0E6B', bgcolor: 'rgba(108, 27, 133, 0.04)' } }}
          >
            Edit My Rating
          </Button>
        )}
      </form>
    </Card>
  );
};

export default FoodRatingCard;
