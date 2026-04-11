import React, { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import { getDashTimeTable } from '../utils/apis';
import MenuCalendar from '../sections/menu/MenuCalendar';

const MyMenuPage = () => {
  const [timeTableData, setTimeTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTimeTableData = async () => {
    setLoading(true);
    try {
      const res = await getDashTimeTable();
      if (res?.length) {
        setTimeTableData(res);
      }
    } catch (error) {
      console.error("Error fetching student timetable:", error);
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
            title="Current Mess Menu" 
        />
      </Box>
    </Container>
  );
};

export default MyMenuPage;
