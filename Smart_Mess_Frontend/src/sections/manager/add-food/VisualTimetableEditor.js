import React, { useState, useEffect } from 'react';
import { Spin, Modal, Form, Input, Select, Popconfirm, message, Tabs, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Typography, Card, Box, Grid, Stack, Button, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { getDashTimeTable, getAllFoodIitems, addFoodItem, delFoodItem, updateFoodItemApi, getFoodItemRating, createFoodItem } from '../../../utils/apis';

const { Option } = Select;
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const VisualTimetableEditor = () => {
  const [timetable, setTimetable] = useState([]);
  const [masterFoodList, setMasterFoodList] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState({ day: '', type: '' });
  const [editingItem, setEditingItem] = useState(null);
  
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await getDashTimeTable(); // Note: getDashTimeTable grabs timetable for current mess
      if (res && res.length !== undefined) {
        setTimetable(res);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load timetable!");
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterFoods = async () => {
    try {
      const res = await getAllFoodIitems();
      if (res && res.length > 0) {
        setMasterFoodList(res);
      }
    } catch (err) {
      console.error(err);
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
    fetchTimetable();
    fetchMasterFoods();
    fetchRatings();
  }, []);

  // --- Handlers ---
  const handleRemoveScheduledItem = async (day, type, mealItemId) => {
    try {
      const res = await delFoodItem({ day, mealType: type, mealItem: mealItemId });
      if (res && res.ok) {
        message.success("Item removed from schedule");
        fetchTimetable();
      } else {
        message.error("Failed to remove item");
      }
    } catch (e) {
      message.error("Network error");
    }
  };

  const openAddModal = (day, type) => {
    setActiveSlot({ day, type });
    addForm.resetFields();
    setAddModalOpen(true);
  };

  const submitAddSchedule = async () => {
    try {
      const values = await addForm.validateFields();
      const payload = {
        day: activeSlot.day,
        mealType: activeSlot.type,
        mealItem: values.foodId
      };
      const res = await addFoodItem(payload);
      if (res && res.ok) {
        message.success(`Successfully scheduled item for ${activeSlot.day} ${activeSlot.type}`);
        setAddModalOpen(false);
        fetchTimetable();
      } else {
        message.error("Failed to schedule item");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openGlobalEditModal = (item) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      name: item.Name,
      image: item.Image,
      category: item.Category ? String(item.Category) : undefined
    });
    setEditModalOpen(true);
  };

  const submitGlobalEdit = async () => {
     try {
       const values = await editForm.validateFields();
       const payload = {
         id: editingItem._id,
         name: values.name,
         image: values.image,
         category: values.category
       };
       const res = await updateFoodItemApi(payload);
       if (res && res.ok) {
         message.success("Global Master Recipe updated");
         setEditModalOpen(false);
         fetchTimetable(); // refresh to show new nested names
         fetchMasterFoods();
       } else {
         message.error("Failed to update item");
       }
     } catch(e) { console.error(e); }
  };

  const submitCreateRecipe = async () => {
     try {
       const values = await createForm.validateFields();
       const payload = {
         name: values.name,
         image: values.image || "https://via.placeholder.com/150",
         category: Number(values.category) || 2
       };
       const res = await createFoodItem(payload);
       if (res && res.ok) {
         message.success("New Master Recipe created!");
         setCreateModalOpen(false);
         createForm.resetFields();
         fetchMasterFoods();
       } else {
         message.error("Failed to create recipe");
       }
     } catch(e) {
       console.error(e);
     }
  };


  // --- Render Helpers ---
  const renderMealSlotItems = (day, mealType) => {
    const dailyData = timetable.find(d => d.Day === day && d.Type === mealType);
    const assignedItems = dailyData?.Items || [];

    return (
      <Box sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: '#fafafa', border: '1px solid #f0f0f0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 800 }}>{mealType}</Typography>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<PlusOutlined />}
            onClick={() => openAddModal(day, mealType)}
            sx={{ bgcolor: '#ffad4a', color: '#2E0845', '&:hover': { bgcolor: '#e89520' } }}
          >
            Add Item
          </Button>
        </Stack>

        <Grid container spacing={2}>
          {assignedItems.length > 0 ? assignedItems.map((item) => {
             if (!item) return null; // Defensive check
             
             // Check ratings map
             const itemRatingStat = ratings.find(r => r.FoodItem === item._id);
             const ratingScore = itemRatingStat?.Rating?.toFixed(1) || 'N/A';
             const reviewCount = itemRatingStat?.NumberOfReviews || 0;
             
             return (
               <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                 <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid rgba(108,27,133,0.1)', borderRadius: 2 }}>
                   <Box sx={{ p: 2, flexGrow: 1, position: 'relative' }}>
                     <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', px: 1, py: 0.5, borderRadius: 2, display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <StarIcon sx={{ color: '#ffad4a', fontSize: '14px', mr: 0.5 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#2E0845' }}>{ratingScore}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5, fontSize: '0.65rem' }}>({reviewCount})</Typography>
                     </Box>
                     <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#2E0845', mt: 1 }}>{item.Name}</Typography>
                   </Box>
                   <Divider sx={{ my: 0 }} />
                   <Stack direction="row" justifyContent="space-between" sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.02)' }}>
                     <IconButton size="small" onClick={() => openGlobalEditModal(item)}>
                       <EditOutlined style={{ color: '#6c1b85', fontSize: '14px' }} />
                     </IconButton>
                     <Popconfirm
                       title="Remove this item from the schedule?"
                       onConfirm={() => handleRemoveScheduledItem(day, mealType, item._id)}
                       okText="Yes, Remove"
                       cancelText="No"
                     >
                       <IconButton size="small">
                         <DeleteOutlined style={{ color: '#d32f2f', fontSize: '14px' }} />
                       </IconButton>
                     </Popconfirm>
                   </Stack>
                 </Card>
               </Grid>
             );
          }) : (
             <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 4 }}>
                   No items scheduled. Click "Add Item" to assign food.
                </Typography>
             </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const tabItems = DAYS.map(day => ({
    key: day,
    label: <span style={{ fontWeight: 600, padding: '0 8px' }}>{day}</span>,
    children: (
       <Box sx={{ animation: 'fade-in 0.3s ease-out' }}>
          {MEAL_TYPES.map(type => renderMealSlotItems(day, type))}
       </Box>
    )
  }));


  return (
    <Card sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: '0 8px 32px rgba(108,27,133,0.08)', border: '1px solid rgba(108,27,133,0.1)' }}>
      <Typography variant="h4" sx={{ mb: 1, color: '#2E0845', fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>
        Visual Timetable Editor
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        Select a day to view and precisely map its active meal assignments.
      </Typography>
      
      <Spin spinning={loading} tip="Synchronizing Timetable...">
        <Tabs 
          defaultActiveKey="Monday" 
          items={tabItems}
          type="card"
          tabBarStyle={{ marginBottom: 24 }}
        />
      </Spin>

      {/* ADD ITEM TO SCHEDULE MODAL */}
      <Modal
        title={<Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#2E0845' }}>Add to {activeSlot.day} {activeSlot.type}</Typography>}
        open={addModalOpen}
        onOk={submitAddSchedule}
        onCancel={() => setAddModalOpen(false)}
        okText="Schedule Food"
        okButtonProps={{ style: { background: '#6c1b85' } }}
      >
        <Form form={addForm} layout="vertical" sx={{ mt: 3 }}>
          <Form.Item 
            label="Search Master Catalog" 
            name="foodId" 
            rules={[{ required: true, message: "Please select an item" }]}
          >
            <Select
              showSearch
              placeholder="Search existing food recipes..."
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={masterFoodList.map(f => ({ value: f.Id, label: f.Name }))}
              size="large"
            />
          </Form.Item>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Note: If the food is missing, add it to the catalog first.
            </Typography>
            <Button size="small" variant="text" onClick={() => setCreateModalOpen(true)} sx={{ color: '#2E0845', fontWeight: 700 }}>
               + Add Food Item
            </Button>
          </Box>
        </Form>
      </Modal>

      {/* CREATE NEW RECIPE MODAL */}
      <Modal
        title={<Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#2E0845' }}>Add New Food Item to Catalog</Typography>}
        open={createModalOpen}
        onOk={submitCreateRecipe}
        onCancel={() => setCreateModalOpen(false)}
        okText="Create Recipe"
        okButtonProps={{ style: { background: '#4CAF50', color: '#fff' } }}
      >
        <Form form={createForm} layout="vertical" sx={{ mt: 3 }}>
          <Form.Item label="Food Item Name" name="name" rules={[{ required: true, message: 'Please enter the food name (e.g. Poha, Tea)' }]}>
            <Input size="large" placeholder="e.g., Masala Poha" />
          </Form.Item>
          <Form.Item name="category" label="Category" initialValue="1" rules={[{ required: true }]}>
             <Select size="large">
               <Option value="1">Breakfast Core</Option>
               <Option value="2">Main Dish</Option>
               <Option value="3">Side / Dessert / Beverage</Option>
             </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* EDIT GLOBAL ITEM MODAL */}
      <Modal
        title={<Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#2E0845' }}>Edit Recipe globally</Typography>}
        open={editModalOpen}
        onOk={submitGlobalEdit}
        onCancel={() => setEditModalOpen(false)}
        okText="Save Master Changes"
        okButtonProps={{ style: { background: '#ffad4a', color: '#2E0845' } }}
      >
        <Form form={editForm} layout="vertical" sx={{ mt: 3 }}>
          <Form.Item label="Food Item Name" name="name" rules={[{ required: true }]}>
            <Input size="large" placeholder="e.g. Masala Poha" />
          </Form.Item>
          <Form.Item name="category" label="Cuisine Category" rules={[{ required: true }]}>
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

export default VisualTimetableEditor;
