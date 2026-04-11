import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Grid, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, MenuItem, Select, Chip, Snackbar, Alert } from '@mui/material';
import { Card } from 'antd';
import { bookGuestMealApi, getMyGuestBookingsApi, getAllGuestBookingsApi } from '../utils/apis';

const GuestBookingPage = () => {
  const [role, setRole] = useState('user');
  const [myBookings, setMyBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  
  // Form State
  const [date, setDate] = useState('');
  const [mealType, setMealType] = useState('Lunch');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setRole(parsed.Role);
      if (parsed.Role === 'user') {
        fetchMyBookings();
      } else {
        fetchAllBookings();
      }
    }
  }, []);

  const fetchMyBookings = async () => {
    const res = await getMyGuestBookingsApi();
    if (res?.length) setMyBookings(res);
  }

  const fetchAllBookings = async () => {
     const res = await getAllGuestBookingsApi();
     if (res?.length) setAllBookings(res);
  }

  const handleBookMeal = async () => {
    if(!date) {
      setSnack({open: true, msg: 'Select a date', severity: 'error'});
      return false;
    }
    const res = await bookGuestMealApi({ date, mealType, numberOfGuests: guests });
    if (res?.ok) {
       setSnack({open: true, msg: 'Guest meal booked!', severity: 'success'});
       fetchMyBookings();
    } else {
       setSnack({open: true, msg: 'Booking failed', severity: 'error'});
    }
    return true;
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4, color: '#6c1b85', fontWeight: 700 }}>
        Guest Meal Bookings
      </Typography>

      {role === 'user' && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
             <Card title={<Typography variant="h6">Book New Guest Meal</Typography>} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Box display="flex" flexDirection="column" gap={3}>
                   <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} fullWidth />
                   <Select value={mealType} onChange={(e) => setMealType(e.target.value)} fullWidth>
                      <MenuItem value="Breakfast">Breakfast</MenuItem>
                      <MenuItem value="Lunch">Lunch</MenuItem>
                      <MenuItem value="Snacks">Snacks</MenuItem>
                      <MenuItem value="Dinner">Dinner</MenuItem>
                   </Select>
                   <TextField type="number" label="Number of Guests" value={guests} onChange={(e) => setGuests(e.target.value)} fullWidth InputProps={{ inputProps: { min: 1, max: 10 } }} />
                   <Button variant="contained" onClick={handleBookMeal} sx={{ bgcolor: '#ffad4a', color: '#2E0845', '&:hover': { bgcolor: '#e89520' } }}>Confirm Booking</Button>
                </Box>
             </Card>
          </Grid>
          <Grid item xs={12} md={8}>
             <Card title={<Typography variant="h6">My Previous Bookings</Typography>} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                 <Table>
                    <TableHead>
                       <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Meal</TableCell>
                          <TableCell>Guests</TableCell>
                          <TableCell>Status</TableCell>
                       </TableRow>
                    </TableHead>
                    <TableBody>
                       {myBookings.map((b) => (
                          <TableRow key={b._id}>
                             <TableCell>{new Date(b.date).toLocaleDateString()}</TableCell>
                             <TableCell>{b.mealType}</TableCell>
                             <TableCell>{b.numberOfGuests}</TableCell>
                             <TableCell><Chip label={b.status} color={b.status === 'Approved' ? 'success' : 'default'} size="small" /></TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
             </Card>
          </Grid>
        </Grid>
      )}

      {(role === 'manager' || role === 'secy' || role === 'dean') && (
        <Card title={<Typography variant="h6">Incoming Guest Bookings</Typography>} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Table>
               <TableHead>
                  <TableRow>
                     <TableCell>Host Student</TableCell>
                     <TableCell>Date</TableCell>
                     <TableCell>Meal Type</TableCell>
                     <TableCell>Guest Count</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allBookings.map((b) => (
                     <TableRow key={b._id}>
                        <TableCell>{b.hostUserId?.Username || 'Student'} ({b.hostUserId?.Email})</TableCell>
                        <TableCell>{new Date(b.date).toLocaleDateString()}</TableCell>
                        <TableCell>{b.mealType}</TableCell>
                        <TableCell>{b.numberOfGuests}</TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
        </Card>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({...snack, open: false})}>
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default GuestBookingPage;
