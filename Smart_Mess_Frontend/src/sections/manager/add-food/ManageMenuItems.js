import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Typography, Card, Box } from '@mui/material';
import { getAllFoodIitems, updateFoodItemApi, deleteFoodItemApi, getFoodItemRating } from '../../../utils/apis';
import StarIcon from '@mui/icons-material/Star';

const { Option } = Select;

const ManageMenuItems = () => {
  const [data, setData] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getAllFoodIitems();
      if (res && !res.Error) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load food items");
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await getFoodItemRating();
      if (res && Array.isArray(res)) setRatings(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchRatings();
  }, []);

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      name: record.Name,
      image: record.Img,
      category: record.Category ? String(record.Category) : undefined
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteFoodItemApi(id);
      if (res && res.ok) {
        message.success("Food item deleted globally");
        fetchItems();
      } else {
        message.error("Failed to delete item");
      }
    } catch (error) {
      message.error("Error connecting to server");
    }
  };

  const handleModalSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        const res = await updateFoodItemApi({
          id: editingItem.Id,
          name: values.name,
          image: values.image,
          category: values.category
        });
        if (res && res.ok) {
          message.success("Food item updated successfully");
          setIsModalOpen(false);
          fetchItems();
        } else {
          message.error("Failed to update item");
        }
      }
    } catch (error) {
      console.error("Validation Error:", error);
    }
  };

  const columns = [
    {
      title: 'Global ID',
      dataIndex: 'Id',
      key: 'Id',
      width: 150,
      render: (text) => <span style={{ fontSize: '11px', color: '#919eab' }}>{text}</span>
    },
    {
      title: 'Meal Image',
      dataIndex: 'Img',
      key: 'Img',
      width: 100,
      render: (imgSrc) => (
        <img 
          src={imgSrc} 
          alt="meal" 
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' }} 
        />
      ),
    },
    {
      title: 'Item Name',
      dataIndex: 'Name',
      key: 'Name',
      render: (text) => <Typography sx={{ fontWeight: 600 }}>{text}</Typography>,
    },
    {
      title: 'Category',
      dataIndex: 'Category',
      key: 'Category',
      render: (category) => {
        const catMap = { "1": "Breakfast Core", "2": "Main Dish", "3": "Side / Dessert" };
        return catMap[category] || 'Unknown';
      }
    },
    {
      title: 'Rating',
      key: 'Rating',
      render: (_, record) => {
         const itemRatingStat = ratings.find(r => r.FoodItem === record.Id);
         const ratingScore = itemRatingStat?.Rating?.toFixed(1) || 'N/A';
         const reviewCount = itemRatingStat?.NumberOfReviews || 0;
         return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
               <StarIcon sx={{ color: '#ffad4a', fontSize: '16px' }} />
               <Typography variant="body2" sx={{ fontWeight: 700 }}>{ratingScore}</Typography>
               <Typography variant="caption" sx={{ color: '#919eab' }}>({reviewCount})</Typography>
            </div>
         );
      }
    },
    {
      title: 'Actions',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ background: '#ffad4a', borderColor: '#ffad4a', color: '#2E0845' }}
          />
          <Popconfirm
            title="Delete the meal item?"
            description="Are you sure to delete this item? It will be removed from all future timetables."
            onConfirm={() => handleDelete(record.Id)}
            okText="Yes, Delete"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button danger type="primary" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(108,27,133,0.08)', border: '1px solid rgba(108,27,133,0.1)', minHeight: 400 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#2E0845', fontWeight: 700, fontFamily: "'DM Serif Display', serif", borderBottom: '2px solid rgba(108,27,133,0.1)', pb: 2 }}>
        Global Master Catalog
      </Typography>
      
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="Id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 600 }}
        />
      </Box>

      <Modal
        title={<Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#2E0845' }}>Edit Menu Item</Typography>}
        open={isModalOpen}
        onOk={handleModalSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Save Changes"
        okButtonProps={{ style: { background: '#6c1b85', borderColor: '#6c1b85' } }}
      >
        <Form form={form} layout="vertical" sx={{ mt: 3 }}>
          <Form.Item
            label="Food Item Name"
            name="name"
            rules={[{ required: true, message: "Please input name of Food Item!" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            label="Image URL"
            name="image"
            rules={[{ required: true, message: "Please input the link to image" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item 
             name="category" 
             label="Cuisine Type"
             rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="1">Breakfast Core</Option>
              <Option value="2">Main Dish</Option>
              <Option value="3">Side / Dessert</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageMenuItems;
