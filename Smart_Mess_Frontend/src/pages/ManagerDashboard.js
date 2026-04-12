import { Card, Container, Stack, Typography, Grid, Box, CircularProgress, Avatar } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import '../utils/fadeAnimation.css';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getAllSuggestions } from './user/apis';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [availableItems, setAvailableItems] = useState(null);
    const [allFoodItems, setAllFoodItems] = useState([]);
    
    // New States for Redesign Features
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);

    const getAllTimeSeriesData = useCallback(async () => {
        try {
            const url = `${process.env.REACT_APP_SERVER_URL}/manager/dashboard/getTimeSeries`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            const data = await res.json();
            return data;
        } catch (err) {
            console.log('error', err);
            return [];
        }
    }, []);

    const fetchAllFoodItems = useCallback(async () => {
        try {
            const url = `${process.env.REACT_APP_SERVER_URL}/manager/dashboard/allFoodItems`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }, []);

    const fetchSuggestions = useCallback(async () => {
        try {
            const res = await getAllSuggestions();
            const suggestionsArray = res?.data?.suggestions || [];
            // Filter to only show OPEN suggestions and take top 5
            const openSuggestions = Array.isArray(suggestionsArray) 
                ? [...suggestionsArray].reverse().filter(s => s.status === 'open').slice(0, 5) 
                : [];
            setSuggestions(openSuggestions);
        } catch (error) {
            console.error("Failed to load suggestions", error);
        } finally {
            setLoadingSuggestions(false);
        }
    }, []);

    useEffect(() => {
        getAllTimeSeriesData().then((res) => {
            setTimeSeriesData(res);
        });
        fetchAllFoodItems().then((res) => {
            setAllFoodItems(res);
        });
        fetchSuggestions();
    }, [getAllTimeSeriesData, fetchAllFoodItems, fetchSuggestions]);

    useEffect(() => {
        if (timeSeriesData && allFoodItems && allFoodItems.length > 0) {
            const currSet = new Set();
            timeSeriesData.forEach((ele) => {
                currSet.add(ele.FoodItemId);
            });
            const arr = [];
            allFoodItems.forEach((ele) => {
                if (currSet.has(ele.Id)) {
                    arr.push({
                        value: ele.Id,
                        label: ele.Name
                    })
                }
            });
            setAvailableItems(arr);
        }
    }, [timeSeriesData, allFoodItems]);

    const filterHandler = useCallback((foodId) => {
        const currItems = [];
        timeSeriesData.forEach((ele) => {
            if (ele.FoodItemId === foodId) {
                const date = new Date(ele.Date);
                currItems.push({ 
                    'Date': `${date.getDate()}/${date.getMonth() + 1}`, 
                    'Rating': ele.Rating, 
                    'NoOfReviews': ele.NoOfReviews 
                });
            }
        });
        setFilterData(currItems);
    }, [timeSeriesData]);

    const onChange = useCallback((value) => {
        filterHandler(value);
        setSelected(value);
    }, [filterHandler]);

    useEffect(() => {
        if (availableItems && availableItems.length > 0 && !selected) {
            onChange(availableItems[0].value);
        }
    }, [availableItems, selected, onChange]);

    const filterOption = (input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const SelectFood = (props) => (
        <Select
            showSearch
            placeholder="Search Food Item"
            optionFilterProp="children"
            onChange={onChange}
            value={selected}
            filterOption={filterOption}
            options={props.options}
            style={{ width: '100%', maxWidth: '300px' }}
        />
    );

    SelectFood.propTypes = {
        options: PropTypes.array
    };

    // Dynamic Summary Stats logic
    const openIssuesCount = suggestions.length > 0 ? `${suggestions.length}+` : "0";
    const totalFoodTracked = allFoodItems.length;
    
    // Quick average rating calculation from whatever is currently graphed
    const avgRating = filterData.length > 0 
        ? (filterData.reduce((acc, curr) => acc + curr.Rating, 0) / filterData.length).toFixed(1) 
        : "N/A";

    return (
        <Container maxWidth="xl">
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Typography variant="h3" sx={{ color: '#2E0845', fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>
                    Manager Portal Overview
                </Typography>
            </Stack>

            {/* KPI ROW */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #7b2d94 0%, #4A0E6B 100%)', color: 'white', display: 'flex', alignItems: 'center', boxShadow: '0 8px 24px 0 rgba(108,27,133,0.3)' }}>
                        <AssessmentIcon sx={{ fontSize: 50, opacity: 0.8, mr: 2 }} />
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>{avgRating}</Typography>
                            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Current Item Avg Rating</Typography>
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #FFAD4A 0%, #D48827 100%)', color: 'white', display: 'flex', alignItems: 'center', boxShadow: '0 8px 24px 0 rgba(255,173,74,0.3)', cursor: 'pointer' }} onClick={() => navigate('/dashboard/suggestions')}>
                        <ErrorOutlineIcon sx={{ fontSize: 50, opacity: 0.8, mr: 2 }} />
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>{openIssuesCount}</Typography>
                            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Active Student Complaints</Typography>
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', display: 'flex', alignItems: 'center', boxShadow: '0 8px 24px 0 rgba(79,172,254,0.3)' }}>
                        <FastfoodIcon sx={{ fontSize: 50, opacity: 0.8, mr: 2 }} />
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>{totalFoodTracked}</Typography>
                            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Menu Items</Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* MAIN DASHBOARD GRID */}
            <Grid container spacing={3}>
                
                {/* Analytics Chart Block */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                        <Box sx={{ p: 3, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 700 }}>Food Performance Timeline</Typography>
                            <SelectFood options={availableItems} />
                        </Box>
                        <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {filterData.length === 0 ? (
                                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', color: 'text.secondary' }}>
                                    <Typography>No data available for this item</Typography>
                                </Box>
                            ) : (
                                <>
                                    <ResponsiveContainer width={'100%'} height={250}>
                                        <LineChart data={filterData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="Date" axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Legend verticalAlign="top" height={36} />
                                            <Line name="Avg Rating Out of 5" type="monotone" dataKey="Rating" stroke="#6c1b85" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <Box sx={{ mt: 3 }}>
                                        <ResponsiveContainer width={'100%'} height={150}>
                                            <LineChart data={filterData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="Date" axisLine={false} tickLine={false} fontSize={12} />
                                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Line name="Total Votes Cast" type="monotone" dataKey="NoOfReviews" stroke="#ffad4a" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Card>
                </Grid>

                {/* Open Complaints/Issues Feed Block */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                        <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 700 }}>Priority Issues Feed</Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            {loadingSuggestions ? (
                                <Box sx={{ display:'flex', justifyContent:'center', py: 5 }}><CircularProgress sx={{color: '#6c1b85'}}/></Box>
                            ) : suggestions.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <Typography variant="body2" color="textSecondary">No open complaints right now!</Typography>
                                </Box>
                            ) : (
                                <Stack spacing={2}>
                                    {suggestions.map((issue) => (
                                        <Card key={issue._id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', borderColor: 'rgba(108,27,133,0.15)', cursor: 'pointer', '&:hover': { background: 'rgba(108,27,133,0.02)'} }} onClick={() => navigate('/dashboard/suggestions')}>
                                            <Avatar sx={{ bgcolor: 'rgba(255,173,74,0.2)', color: '#D48827', mr: 2 }}>
                                                {issue.title ? issue.title.charAt(0).toUpperCase() : '!'}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{issue.title}</Typography>
                                                <Typography variant="caption" noWrap sx={{ display: 'block', color: 'text.secondary' }}>{issue.description}</Typography>
                                            </Box>
                                            <ArrowForwardIosIcon sx={{ fontSize: 14, color: 'text.disabled', ml: 1 }} />
                                        </Card>
                                    ))}
                                    <Box sx={{ textAlign: 'center', pt: 1 }}>
                                        <Typography variant="button" sx={{ color: '#6c1b85', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }} onClick={() => navigate('/dashboard/suggestions')}>
                                            VIEW ALL ISSUES
                                        </Typography>
                                    </Box>
                                </Stack>
                            )}
                        </Box>
                    </Card>
                </Grid>

            </Grid>
        </Container>
    );
};

export default ManagerDashboard;