import React, { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import { getManagerTimeTable } from '../utils/apis';
import MenuCalendar from '../sections/menu/MenuCalendar';

const ManagerMenuPage = () => {
  const [timeTableData, setTimeTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTimeTableData = async () => {
    setLoading(true);
    try {
      const res = await getManagerTimeTable();
      if (res?.length) {
        setTimeTableData(res);
      }
    } catch (error) {
      console.error("Error fetching manager timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTimeTableData();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <MenuCalendar 
            loading={loading} 
            data={timeTableData} 
            title="Institutional Menu Control" 
        />
      </Box>
    </Container>
  );
};

export default ManagerMenuPage;