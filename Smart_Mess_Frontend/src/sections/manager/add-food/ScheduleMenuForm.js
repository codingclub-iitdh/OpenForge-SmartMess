import React, { useState, useEffect } from 'react';
import { Form, Button, Select } from 'antd';
import { Typography, Card, Grid, Snackbar, Alert } from '@mui/material';
import { addFoodItem, getAllFoodIitems } from '../../../utils/apis';

const { Option } = Select;

const filterOption = (input, option) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

const ScheduleMenuForm = ({ onUpdate }) => {
  const [form] = Form.useForm();
  const [foodItems, setFoodItems] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchFoodItems = async () => {
    try {
      const res = await getAllFoodIitems();
      setFoodItems(res || []);
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const onFinish = async (values) => {
    try {
      await addFoodItem(values);
      form.resetFields();
      setOpen(true);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error scheduling food item:", error);
    }
  };

  return (
    <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(108,27,133,0.08)', border: '1px solid rgba(108,27,133,0.1)', minHeight: 400 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#2E0845', fontWeight: 700, fontFamily: "'DM Serif Display', serif", borderBottom: '2px solid rgba(108,27,133,0.1)', pb: 2 }}>
        Schedule Item on Menu
      </Typography>

      <Form
        form={form}
        name="schedule-item"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Form.Item name="day" label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Day of Week</Typography>} rules={[{ required: true }]}>
              <Select size="large" placeholder="Select day...">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <Option key={day} value={day}>{day}</Option>
                ))}
              </Select>
            </Form.Item>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Form.Item name="mealType" label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Meal Slot</Typography>} rules={[{ required: true }]}>
              <Select size="large" placeholder="Select slot...">
                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(slot => (
                  <Option key={slot} value={slot}>{slot}</Option>
                ))}
              </Select>
            </Form.Item>
          </Grid>
        </Grid>

        <Form.Item name="mealItem" label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Choose from Matrix</Typography>} rules={[{ required: true }]}>
          <Select
            size="large"
            showSearch
            placeholder="Search by Food Item Name..."
            optionFilterProp="children"
            filterOption={filterOption}
            options={foodItems.map((item) => ({ 'value': item?.Id, 'label': item?.Name }))}
          />
        </Form.Item>

        <Form.Item sx={{ mt: 2 }}>
          <Button type="primary" htmlType="submit" size="large" style={{ background: '#ffad4a', borderColor: '#ffad4a', color: '#2E0845', borderRadius: 8, fontWeight: 700, height: 48, padding: '0 32px' }}>
            Publish to Live Menu
          </Button>
        </Form.Item>
      </Form>

      <Snackbar 
        open={open} 
        autoHideDuration={4000} 
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 2, bgcolor: '#ffad4a', color: '#2E0845' }}>
          Menu updated successfully!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ScheduleMenuForm;
