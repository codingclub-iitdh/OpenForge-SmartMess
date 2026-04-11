import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import VisualTimetableEditor from '../sections/manager/add-food/VisualTimetableEditor';
import '../utils/fadeAnimation.css';

const ManagerAddFood = () => {
  const [user, setUser] = useState({});

  const getUser = async () => {
    let userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (user?.Role === "user") return <Navigate to="/404" />;

  return (
    <Container maxWidth="xl" sx={{ mt: -2 }}>
      <Box sx={{ height: '100%', py: 3 }}>
        <Typography variant="h3" sx={{ color: '#6c1b85', fontWeight: 800, fontFamily: "'DM Serif Display', serif", mb: 2 }}>
          Kitchen Management Suite
        </Typography>
        
        <VisualTimetableEditor />
      </Box>
    </Container>
  );
};

export default ManagerAddFood;

