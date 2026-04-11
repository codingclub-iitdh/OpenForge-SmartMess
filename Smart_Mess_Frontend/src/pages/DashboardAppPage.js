import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Card, Collapse, Spin } from 'antd';

import { Container, Grid, Typography, Rating, Box, Button, Stack, Avatar } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BugReportIcon from '@mui/icons-material/BugReport';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { getDashTimeTable, getFoodItemRating } from '../utils/apis';
import { find } from 'lodash';

const { Meta } = Card;

const MyMenuPage = () => {
  const date = new Date();
  let today = date.getDay();
  if (today === 0) {
    today = 7;
  }

  const [timeTableData, setTimeTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [defActiveKey, setDefActiveKey] = useState(0);
  const [itemRating, setItemRatings] = useState([]);

  const [ser, setSer] = useState('');

  function getMealTime() {
    const currentTime = new Date();
    const hours = currentTime.getHours();

    if (hours >= 4 && hours < 10) {
      setSer('Breakfast');
      setDefActiveKey(1);
    } else if (hours >= 10 && hours < 15) {
      setSer('Lunch');
      setDefActiveKey(2);
    } else if (hours >= 15 && hours <= 19) {
      setSer('Snacks');
      setDefActiveKey(3);
    } else if (hours >= 19 && hours < 24) {
      setSer('Dinner');
      setDefActiveKey(4);
    } else {
      setSer('');
      setDefActiveKey(['']);
    }
  }

  useEffect(() => {
    getMealTime();
    const interval = setInterval(() => {
      getMealTime();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const [allData, setAllData] = useState([]);

  const navigate = useNavigate();
  const handleCardPress = (value) => {
    const role = JSON.parse(localStorage.getItem('user'))?.Role;
    if (value && role === 'user') {
      const urlEncode = `/dashboard/ratings?hidden=true&value=${encodeURIComponent(value)}`;
      navigate(urlEncode);
    } else if (role === 'user') {
      navigate('/dashboard/ratings');
    }
  };

  const getTimeTableData = async () => {
    setLoading(true);
    try {
      const res = await getDashTimeTable();
      const ratings = await getFoodItemRating();
      if (res?.length) {
        setAllData(res);
      }
      setItemRatings(Array.isArray(ratings) ? ratings : []);
      setTimeTableData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    }
    setLoading(false);
  };
  useEffect(() => {
    try {
      getTimeTableData();
    } catch (error) {
      setLoading(false);
    }
  }, []);

  const currentDayIndex = new Date().getDay();
  const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    currentDayIndex
  ];

  const getCurrentDayMenu = () => {
    const reqData = [];
    allData.forEach((item) => {
      if (item.Day === currentDayName) {
        reqData.push(item);
      }
    });

    const reqData2 = {};
    reqData.forEach((item) => {
      if (item.Type === 'Breakfast') {
        reqData2.Breakfast = item;
      } else if (item.Type === 'Lunch') {
        reqData2.Lunch = item;
      } else if (item.Type === 'Snacks') {
        reqData2.Snacks = item;
      } else if (item.Type === 'Dinner') {
        reqData2.Dinner = item;
      }
    });
    return reqData2;
  };

  const currentDayMenu = getCurrentDayMenu();
  // console.log(currentDayMenu)

  const items = [
    {
      key: '1',
      label: `Breakfast (07:30 AM - ${currentDayIndex === 0 ? '09:45 AM' : '09:30 AM'})`,
      children: (
        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 16 }}>
          {currentDayMenu?.Breakfast?.Items?.map((item, index) => {
            const currItemRatingStats = find(itemRating, { FoodItem: item?._id });
            const numberOfReviews = currItemRatingStats?.NumberOfReviews;
            const rating = currItemRatingStats?.Rating.toPrecision(2);
            return (
              <Grid item xs={4} sm={4} md={4} lg={4} key={index}>
                <Card
                  onClick={() => {
                    handleCardPress(item?.Name);
                  }}
                  bordered
                  style={{
                    width: '100%',
                  }}
                  cover={
                    <img
                      style={{ height: '160px', objectFit: 'cover' }}
                      alt="example"
                      src={item?.Image}
                      loading="lazy"
                    />
                  }
                >
                  {typeof rating !== 'undefined' ? (
                    <>
                      <Meta title={`${item?.Name}`} />
                      <div
                        style={{
                          display: 'flex',
                          gap: '3px',
                          fontSize: '12px',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Rating name="read-only" value={rating} readOnly precision={0.1} />
                        <span>{numberOfReviews}</span>
                      </div>
                    </>
                  ) : (
                    <Meta title={item?.Name} />
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ),
    },

    {
      key: '2',
      label: 'Lunch (12:30 PM - 02:30 PM)',
      children: (
        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 16 }}>
          {currentDayMenu?.Lunch?.Items?.map((item, index) => {
            const currItemRatingStats = find(itemRating, { FoodItem: item?._id });
            const numberOfReviews = currItemRatingStats?.NumberOfReviews;
            const rating = currItemRatingStats?.Rating.toPrecision(2);
            return (
              <Grid item xs={4} sm={4} md={4} lg={4} key={index}>
                <Card
                  onClick={() => {
                    handleCardPress(item?.Name);
                  }}
                  bordered
                  style={{
                    width: '100%',
                  }}
                  cover={
                    <img
                      style={{ height: '160px', objectFit: 'cover' }}
                      alt="example"
                      src={item?.Image}
                      loading="lazy"
                    />
                  }
                >
                  {typeof rating !== 'undefined' ? (
                    <>
                      <Meta title={`${item?.Name}`} />
                      <div
                        style={{
                          display: 'flex',
                          gap: '3px',
                          fontSize: '12px',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Rating name="read-only" value={rating} readOnly precision={0.1} />
                        <span>{numberOfReviews}</span>
                      </div>
                    </>
                  ) : (
                    <Meta title={item?.Name} />
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ),
    },
    {
      key: '3',
      label: 'Snacks (04:30 PM - 06:00 PM)',
      children: (
        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 16 }}>
          {currentDayMenu?.Snacks?.Items?.map((item, index) => {
            const currItemRatingStats = find(itemRating, { FoodItem: item?._id });
            const numberOfReviews = currItemRatingStats?.NumberOfReviews;
            const rating = currItemRatingStats?.Rating.toPrecision(2);
            return (
              <Grid item xs={4} sm={4} md={4} lg={4} key={index}>
                <Card
                  onClick={() => {
                    handleCardPress(item?.Name);
                  }}
                  bordered
                  style={{
                    width: '100%',
                  }}
                  cover={
                    <img
                      style={{ height: '160px', objectFit: 'cover' }}
                      alt="example"
                      src={item?.Image}
                      loading="lazy"
                    />
                  }
                >
                  {typeof rating !== 'undefined' ? (
                    <>
                      <Meta title={`${item?.Name}`} />
                      <div
                        style={{
                          display: 'flex',
                          gap: '3px',
                          fontSize: '12px',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Rating name="read-only" value={rating} readOnly precision={0.1} />
                        <span>{numberOfReviews}</span>
                      </div>
                    </>
                  ) : (
                    <Meta title={item?.Name} />
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ),
    },
    {
      key: '4',
      label: 'Dinner (07:30 PM - 09:30 PM)',
      children: (
        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 16 }}>
          {currentDayMenu?.Dinner?.Items?.map((item, index) => {
            const currItemRatingStats = find(itemRating, { FoodItem: item?._id });
            const numberOfReviews = currItemRatingStats?.NumberOfReviews;
            const rating = currItemRatingStats?.Rating.toPrecision(2);
            return (
              <Grid item xs={4} sm={4} md={4} lg={4} key={index}>
                <Card
                  onClick={() => {
                    handleCardPress(item?.Name);
                  }}
                  bordered
                  style={{
                    width: '100%',
                  }}
                  cover={
                    <img
                      style={{ height: '160px', objectFit: 'cover' }}
                      alt="example"
                      src={item.Image}
                      loading="lazy"
                    />
                  }
                >
                  {typeof rating !== 'undefined' ? (
                    <>
                      <Meta title={`${item?.Name}`} />
                      <div
                        style={{
                          display: 'flex',
                          gap: '3px',
                          fontSize: '12px',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Rating name="read-only" value={rating} readOnly precision={0.1} />
                        <span>{numberOfReviews}</span>
                      </div>
                    </>
                  ) : (
                    <Meta title={item?.Name} />
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ),
    },
  ];

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: -2 }}>
        {/* HERO SECTION */}
        <Box sx={{ mb: 5, p: 4, borderRadius: 4, background: 'linear-gradient(135deg, #6c1b85 0%, #2E0845 100%)', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 16px 40px -8px rgba(108,27,133,0.5)' }}>
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <Box sx={{ position: 'absolute', bottom: -100, right: 100, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,173,74,0.1)' }} />
            
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontFamily: "'DM Serif Display', serif", position: 'relative', zIndex: 1 }}>
              Welcome back to SmartMess!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 4, maxWidth: 600, position: 'relative', zIndex: 1 }}>
              Checkout what's cooking today, drop a review for your favorite meal, or report any issues directly to the mess administration.
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: 2 }}>
                <Button 
                    variant="contained" 
                    startIcon={<RateReviewIcon />} 
                    sx={{ bgcolor: '#ffad4a', color: '#2E0845', '&:hover': { bgcolor: '#e89520' }, fontWeight: 700 }}
                    onClick={() => navigate('/dashboard/ratings')}
                >
                    Rate Meal
                </Button>
                <Button 
                    variant="outlined" 
                    startIcon={<BugReportIcon />} 
                    sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                    onClick={() => navigate('/dashboard/suggestions')}
                >
                    Report Issue
                </Button>
            </Stack>
        </Box>

        {/* TODAY'S MENU BLOCK */}
        <Typography variant="h4" sx={{ mb: 3, color: '#6c1b85', fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>
          Today's Menu
        </Typography>
        <Spin spinning={loading} size="medium">
          {defActiveKey && <Collapse defaultActiveKey={defActiveKey} size="large" items={items} />}
        </Spin>
      </Container>
    </>
  );
};
export default MyMenuPage;
