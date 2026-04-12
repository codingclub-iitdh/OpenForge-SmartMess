import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import { Typography, Card, Snackbar, Alert } from '@mui/material';
import { createFoodItem } from '../../../utils/apis';

const { Option } = Select;

const MatrixEntryForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = React.useState(false);

  const onFinish = async (values) => {
    try {
      await createFoodItem(values);
      form.resetFields();
      setOpen(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to create food item:", error);
    }
  };

  return (
    <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(108,27,133,0.08)', border: '1px solid rgba(108,27,133,0.1)', minHeight: 400 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#2E0845', fontWeight: 700, fontFamily: "'DM Serif Display', serif", borderBottom: '2px solid rgba(108,27,133,0.1)', pb: 2 }}>
        Create New Food Item
      </Typography>
      
      <Form
        form={form}
        name="matrix-entry"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Food Item Name</Typography>}
          name="name"
          rules={[{ required: true, message: "Please input name of Food Item!" }]}
        >
          <Input size="large" placeholder="e.g. Paneer Butter Masala" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item
          label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Image URL</Typography>}
          name="image"
          rules={[{ required: true, message: "Please input the link to image" }]}
        >
          <Input size="large" placeholder='https://images.unsplash.com/...' style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item 
           name="category" 
           label={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Cuisine Type</Typography>} 
           rules={[{ required: true }]}
        >
          <Select size="large" placeholder="Select category..." style={{ borderRadius: 8 }}>
            <Option value="1">Breakfast Core</Option>
            <Option value="2">Main Dish</Option>
            <Option value="3">Side / Dessert</Option>
          </Select>
        </Form.Item>

        <Form.Item sx={{ mt: 2 }}>
          <Button type="primary" htmlType="submit" size="large" style={{ background: '#6c1b85', borderColor: '#6c1b85', borderRadius: 8, fontWeight: 700, height: 48, padding: '0 32px' }}>
            Create Entry
          </Button>
        </Form.Item>
      </Form>

      <Snackbar 
        open={open} 
        autoHideDuration={4000} 
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          Food Item successfully added to global matrix!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default MatrixEntryForm;
