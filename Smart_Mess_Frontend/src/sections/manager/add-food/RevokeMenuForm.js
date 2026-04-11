import React, { useState, useEffect } from 'react';
import { Form, Button, Select } from 'antd';
import { Typography, Card, Grid, Snackbar, Alert } from '@mui/material';
import { delFoodItem, getDashTimeTable } from '../../../utils/apis';

const { Option } = Select;

const RevokeMenuForm = ({ onUpdate }) => {
  const [form] = Form.useForm();
  const [timeTableData, setTimeTableData] = useState([]);
  const [open, setOpen] = useState(false);
  
  // Local filter states
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const fetchTimeTable = async () => {
    try {
      const res = await getDashTimeTable();
      setTimeTableData(res || []);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  useEffect(() => {
    fetchTimeTable();
  }, []);

  const onFinish = async (values) => {
    try {
      await delFoodItem(values);
      form.resetFields();
      setOpen(true);
      fetchTimeTable(); // Refresh local list
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error revoking food item:", error);
    }
  };

  const filteredItems = timeTableData.find(item => item.Day === selectedDay && item.Type === selectedType)?.Items || [];

  return (
    <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(211,47,47,0.08)', border: '1px solid rgba(211,47,47,0.2)', minHeight: 400 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#d32f2f', fontWeight: 700, fontFamily: "'DM Serif Display', serif", borderBottom: '2px solid rgba(211,47,47,0.1)', pb: 2 }}>
        Revoke Menu Item
      </Typography>

      <Form
        form={form}
        name="revoke-item"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Form.Item name="day" label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Day</Typography>} rules={[{ required: true }]}>
              <Select size="large" placeholder="Select day..." onChange={setSelectedDay}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <Option key={day} value={day}>{day}</Option>
                ))}
              </Select>
            </Form.Item>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Form.Item name="mealType" label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Meal Slot</Typography>} rules={[{ required: true }]}>
              <Select size="large" placeholder="Select slot..." onChange={setSelectedType}>
                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(slot => (
                  <Option key={slot} value={slot}>{slot}</Option>
                ))}
              </Select>
            </Form.Item>
          </Grid>
        </Grid>

        <Form.Item name="mealItem" label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Active Items to Remove</Typography>} rules={[{ required: true }]}>
          <Select size="large" allowClear placeholder="Select assigned item to remove...">
            {filteredItems.map((item) => (
                <Option key={item?._id} value={item?._id}>{item?.Name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item sx={{ mt: 2 }}>
          <Button type="primary" htmlType="submit" size="large" danger style={{ borderRadius: 8, fontWeight: 700, height: 48, padding: '0 32px' }}>
            Confirm Removal
          </Button>
        </Form.Item>
      </Form>

      <Snackbar 
        open={open} 
        autoHideDuration={4000} 
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          Item successfully revoked from live menu.
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default RevokeMenuForm;
