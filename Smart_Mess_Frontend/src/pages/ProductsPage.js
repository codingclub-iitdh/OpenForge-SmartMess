import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import { experimentalStyled as styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import { Helmet } from 'react-helmet-async';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Button, CardActions, CardMedia, Chip, Container, Typography, Snackbar, Alert, Stack } from '@mui/material';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import { Navigate } from 'react-router-dom';
import ApiContext from '../Context/apiContext';
import { submitFeedback } from '../utils/apis';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function HoverRating() {
  const [BreakfastRating, setBreakfastRatings] = React.useState(null);
  const [LunchRating, setLunchRatings] = React.useState(null);
  const [SnacksRating, setsnacksRatings] = React.useState(null);
  const [DinnerRating, setdinnerRatings] = React.useState(null);
  const [HygieneRating, sethygieneRatings] = React.useState(null);
  const [MessServiceRating, setmessServiceRatings] = React.useState(null);
  const [Comments, setcomments] = React.useState(null);
  const [user, setUser] = useState({});
  const [currentAverages, setCurrentAverages] = useState(null);
  const getUser = async () => {
    let user = await localStorage.getItem('user');
    user = await JSON.parse(user);
    setUser(user);
  };

  const context = useContext(ApiContext);
  const { getAllNotitfications } = context;
  useEffect(() => {
    try {
      getUser();
    } catch (error) {
      console.log('error');
    }
  }, []);

  useEffect(() => {
    const fetchCurrentAverages = async () => {
      try {
        const url = `${process.env.REACT_APP_SERVER_URL}/running-average-ratings`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCurrentAverages(Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null);
      } catch (error) {
        console.error('Failed to fetch current ratings:', error.message);
      }
    };

    fetchCurrentAverages();
  }, []);

  const formatAverage = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'No ratings yet';
    }

    return `${Number(value).toFixed(1)} / 5`;
  };

  const ratingCards = [
    {
      key: 'Breakfast',
      image: 'https://media.istockphoto.com/id/938158500/photo/breakfast-table.jpg?s=612x612&w=0&k=20&c=Y8xB6hfe4dSPNyNrPgzP7slHbKhWdEzG7YTk2WXu4lQ=',
      value: BreakfastRating,
      setter: setBreakfastRatings,
      average: currentAverages?.RunningAverageBreakfastRating,
      name: 'breakfast-hover-feedback',
    },
    {
      key: 'Lunch',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeRvcdRG6Ahi21BcICuzay8pW1AWdLqvgFOw&usqp=CAU',
      value: LunchRating,
      setter: setLunchRatings,
      average: currentAverages?.RunningAverageLunchRating,
      name: 'lunch-hover-feedback',
    },
    {
      key: 'Snacks',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQQvV3IWgn7ebaOWxlSIIBUNF19SGTD_Ngyw&usqp=CAU',
      value: SnacksRating,
      setter: setsnacksRatings,
      average: currentAverages?.RunningAverageSnacksRating,
      name: 'snacks-hover-feedback',
    },
    {
      key: 'Dinner',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUBWo70RdiTtAadAMbQCFA6E5hEG7W4nQ7rQhpNYKP6grmyhSmuU9_1jDUHk9_hbYBNBc&usqp=CAU',
      value: DinnerRating,
      setter: setdinnerRatings,
      average: currentAverages?.RunningAverageDinnerRating,
      name: 'dinner-hover-feedback',
    },
    {
      key: 'Hygiene',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDqjJ4WNV0E0nmCGFLBZYUl_J6uOZyDMHKRA&usqp=CAU',
      value: HygieneRating,
      setter: sethygieneRatings,
      average: currentAverages?.RunningAverageHygieneRating,
      name: 'hygiene-hover-feedback',
    },
    {
      key: 'Mess Service',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL4DPJnMsIakcrye0Yjrip3JHV29UmMpN9xvj3eHrlfI4Co1kYHN75575xUKXwNan2ci8&usqp=CAU',
      value: MessServiceRating,
      setter: setmessServiceRatings,
      average: currentAverages?.RunningAverageMessServiceRating,
      name: 'mess-service-hover-feedback',
    },
  ];

  const handleSubmitPress = async () => {
    if (!BreakfastRating || !LunchRating || !SnacksRating || !DinnerRating || !HygieneRating || !MessServiceRating) {
      alert('Please Rate all fields');
    } else {
      const res = await submitFeedback({
        // FormID: localStorage.getItem('feedbackId') || null,
        BreakfastRating,
        LunchRating,
        SnacksRating,
        DinnerRating,
        HygieneRating,
        MessServiceRating,
        Comments,
      });
      console.log(res);
      if (res.status === 200) {
        alert('Feedback Submitted');
        setOpen(true);
        localStorage.removeItem('feedbackId');
      } else if (res.status === 409) {
        alert('Feedback already submitted');
      } else {
        alert('Feedback Submission Failed');
      }
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const vertical = 'top';
  const horizontal = 'center';
  const [open, setOpen] = useState(false);
  return (
    <>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical, horizontal }}
        autoHideDuration={4000}
        key={vertical + horizontal}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Rating submitted successfully!
        </Alert>
      </Snackbar>
      {user?.Role === 'manager' && <Navigate to="/404" />}
      {user?.Role === 'user' && (
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 5, color: '#6c1b85', fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>
            Feedback
          </Typography>
          <div>
            <Helmet>
              <title> Feedback </title>
            </Helmet>

            <Box sx={{ flexGrow: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box
                sx={{
                  mb: 4,
                  p: { xs: 2, md: 3 },
                  borderRadius: 4,
                  border: '1px solid rgba(108, 27, 133, 0.12)',
                  background: 'linear-gradient(135deg, rgba(108,27,133,0.08) 0%, rgba(255,202,117,0.16) 100%)',
                  boxShadow: '0 12px 30px rgba(108,27,133,0.08)',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h5" sx={{ color: '#4b0f61', fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>
                    Current Student Ratings
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6e5a77' }}>
                    Live average ratings are visible here for every meal, hygiene, and mess service category.
                  </Typography>
                  <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap">
                    {ratingCards.map((item) => (
                      <Chip
                        key={item.key}
                        label={`${item.key}: ${formatAverage(item.average)}`}
                        sx={{
                          px: 1,
                          py: 2.6,
                          borderRadius: 999,
                          bgcolor: '#fff',
                          color: '#5c176e',
                          border: '1px solid rgba(92, 23, 110, 0.15)',
                          fontWeight: 700,
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Box>
              <Grid container alignItems="center" justifyContent="center" spacing={2}>
                {ratingCards.map((item) => (
                  <Grid key={item.key} item alignItems="center" justifyContent="center" xs={12} lg={4} md={6}>
                    <Item sx={{ borderRadius: 4, overflow: 'hidden' }}>
                      <Card sx={{ maxWidth: 345, borderRadius: 4, boxShadow: '0 18px 36px rgba(108,27,133,0.08)' }}>
                        <CardMedia
                          sx={{ height: 170 }}
                          image={item.image}
                          title={item.key}
                        />
                        <Container sx={{ py: 2.5 }}>
                          <Stack spacing={1.5}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                              <Typography variant="h5" sx={{ color: '#4b0f61', fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>
                                {item.key}
                              </Typography>
                              <Chip
                                label={`Current: ${formatAverage(item.average)}`}
                                sx={{
                                  bgcolor: 'rgba(255,204,115,0.22)',
                                  color: '#7a1f5c',
                                  fontWeight: 700,
                                }}
                              />
                            </Stack>
                            <Typography variant="body2" sx={{ color: '#7a6a86' }}>
                              Students can see the current average before submitting today&apos;s rating.
                            </Typography>
                          </Stack>
                        </Container>
                        <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                          <Rating
                            name={item.name}
                            value={item.value}
                            precision={1}
                            onChange={(event, newValue) => {
                              item.setter(newValue);
                            }}
                            emptyIcon={<StarIcon style={{ opacity: 0.45 }} fontSize="inherit" />}
                          />
                        </CardActions>
                      </Card>
                    </Item>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography align="left" variant="h5" sx={{ mb: 1 }}>
                Additional Comments
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                id="outlined-basic"
                label="Comments"
                value={Comments}
                variant="outlined"
                onChange={(event) => {
                  setcomments(event.target.value);
                }}
              />
            </Box>
            <br />

            <Button variant="contained" justifyContent="center" onClick={handleSubmitPress}
              sx={{ backgroundColor: '#6c1b85', '&:hover': { backgroundColor: '#4A0E6B' }, fontWeight: 700, px: 5, py: 1.2, borderRadius: 2, boxShadow: '0 4px 14px rgba(108,27,133,0.24)' }}>
              Submit
            </Button>
          </div>
        </Container>
      )}
    </>
  );
}
