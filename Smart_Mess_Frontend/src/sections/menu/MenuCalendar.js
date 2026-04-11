import React from 'react';
import { Card, Collapse, Spin, Divider } from 'antd';
import { Grid, Typography, Box, Stack, Tooltip } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const { Meta } = Card;

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const MenuCalendar = ({ loading, data, title = "Weekly Highlights" }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayIndex = new Date().getDay() === 0 ? 7 : new Date().getDay();

  const renderMealSection = (day, mealType) => {
    const mealData = data.find(d => d.Day === day && d.Type === mealType);
    const items = mealData?.Items || [];

    return (
      <Box sx={{ py: 2 }}>
        <Grid container spacing={2}>
          {items.length > 0 ? (
            items.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`${day}-${mealType}-${index}`}>
                <Tooltip title={`Category: ${item?.Category || 'Standard'}`} arrow>
                  <Card
                    hoverable
                    sx={{ 
                      borderRadius: 3, 
                      overflow: 'hidden', 
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(108,27,133,0.1)',
                      bgcolor: 'white'
                    }}
                  >
                    <Box sx={{ p: 2, position: 'relative' }}>
                       <Box sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10, 
                          bgcolor: 'rgba(255,173,74,0.9)', 
                          color: '#2E0845', 
                          px: 1, 
                          borderRadius: 1, 
                          fontSize: '0.7rem', 
                          fontWeight: 800,
                          zIndex: 1
                        }}>
                          LIVE
                        </Box>
                        <Meta 
                          title={<Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mt: 1 }}>{item?.Name}</Typography>} 
                          description={null}
                        />
                    </Box>
                  </Card>
                </Tooltip>
              </Grid>
            ))
          ) : (
            <Typography variant="body2" sx={{ px: 2, color: 'text.disabled', fontStyle: 'italic' }}>
              No items scheduled for this slot.
            </Typography>
          )}
        </Grid>
      </Box>
    );
  };

  const getDayTabs = (day) => {
    return MEAL_TYPES.map(type => {
      let timeLabel = '';
      if (type === 'Breakfast') timeLabel = day === 'Sunday' ? '07:30 AM - 09:45 AM' : '07:30 AM - 09:30 AM';
      else if (type === 'Lunch') timeLabel = '12:30 PM - 02:30 PM';
      else if (type === 'Snacks') timeLabel = '04:30 PM - 06:00 PM';
      else if (type === 'Dinner') timeLabel = '07:30 PM - 09:30 PM';

      return {
        key: `${day}-${type}`,
        label: (
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 18, color: '#ffad4a' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{type} <span style={{opacity: 0.7, fontWeight: 500}}>({timeLabel})</span></Typography>
          </Stack>
        ),
        children: renderMealSection(day, type),
      };
    });
  };

  const dayCollapseItems = days.map((day, index) => ({
    key: (index + 1).toString(),
    label: (
      <Typography variant="h6" sx={{ color: '#2E0845', fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>
        {day} {todayIndex === index + 1 ? "(Today)" : ""}
      </Typography>
    ),
    children: (
        <Collapse 
            ghost 
            defaultActiveKey={MEAL_TYPES.map(t => `${day}-${t}`)} 
            items={getDayTabs(day)} 
            expandIconPosition="end"
        />
    ),
  }));

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Box sx={{ width: 4, height: 32, bgcolor: '#ffad4a', borderRadius: 4 }} />
        <Typography variant="h3" sx={{ color: '#6c1b85', fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>
          {title}
        </Typography>
      </Stack>

      <Spin spinning={loading} size="large" tip="Synchronizing Canteen Menu...">
        <Collapse 
            accordion 
            defaultActiveKey={[todayIndex.toString()]} 
            size="large" 
            items={dayCollapseItems} 
            sx={{ 
                bgcolor: 'transparent',
                '& .ant-collapse-item': {
                    mb: 2,
                    borderRadius: '12px !important',
                    border: '1px solid rgba(108,27,133,0.1) !important',
                    overflow: 'hidden',
                    bgcolor: 'white'
                },
                '& .ant-collapse-header': {
                    alignItems: 'center !important'
                }
            }}
        />
      </Spin>
    </Box>
  );
};

export default MenuCalendar;
