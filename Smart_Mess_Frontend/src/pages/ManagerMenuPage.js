import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, Stack, TextField, Grid, Snackbar, Alert } from '@mui/material';
import { Upload, Spin, Divider } from 'antd';
import { UploadOutlined, BuildOutlined } from '@ant-design/icons';
import { getManagerTimeTable, uploadMenuPdfApi, updateIngredientBrandsApi } from '../utils/apis';
import MenuCalendar from '../sections/menu/MenuCalendar';
import { Card } from 'antd';

const ManagerMenuPage = () => {
  const [timeTableData, setTimeTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [sneackBarInfo, setSnackBarInfo] = useState({ open: false, msg: '', severity: 'success' });
  
  // Ingredients state
  const [brands, setBrands] = useState({ rice: '', flour: '', spices: '', iceCream: '', dairy: '', oil: '' });
  const [qualityNotes, setQualityNotes] = useState('');

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

  const handlePdfUpload = async (file) => {
    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await uploadMenuPdfApi(formData);
      if (res?.ok) {
        setSnackBarInfo({ open: true, msg: 'Official Menu PDF uploaded successfully!', severity: 'success' });
      } else {
        setSnackBarInfo({ open: true, msg: 'Failed to upload PDF', severity: 'error' });
      }
    } catch (e) {
      setSnackBarInfo({ open: true, msg: 'Error uploading PDF', severity: 'error' });
    }
    setUploadingPdf(false);
    return false; // Prevent defaultantd upload behavior
  };

  const handleSaveIngredients = async () => {
    try {
      const res = await updateIngredientBrandsApi({ ...brands, qualityNotes });
      if (res?.ok) {
         setSnackBarInfo({ open: true, msg: 'Ingredient quality records updated!', severity: 'success' });
      } else {
         setSnackBarInfo({ open: true, msg: 'Failed to update ingredients', severity: 'error' });
      }
    } catch (e) {
       setSnackBarInfo({ open: true, msg: 'Error updating ingredients', severity: 'error' });
    }
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        
        {/* NEW FEATURES SECTION */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* PDF UPLOAD CARD */}
          <Grid item xs={12} md={5}>
            <Card title={<Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 700 }}>Upload Official PDF Menu</Typography>} bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload a monthly official menu PDF. This will be instantly visible to all students and Dean SW.
               </Typography>
               <Upload 
                  beforeUpload={handlePdfUpload} 
                  showUploadList={false}
                  accept=".pdf"
               >
                 <Button 
                   variant="contained" 
                   startIcon={<UploadOutlined />} 
                   disabled={uploadingPdf}
                   sx={{ bgcolor: '#ffad4a', color: '#2E0845', '&:hover': { bgcolor: '#e89520' } }}
                 >
                   {uploadingPdf ? 'Uploading...' : 'Click to Upload Menu PDF'}
                 </Button>
               </Upload>
            </Card>
          </Grid>
          
          {/* INGREDIENTS TRACKER CARD */}
          <Grid item xs={12} md={7}>
             <Card title={<Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 700 }}>Ingredient Quality & Brands Tracker</Typography>} bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                   (Optional) Declare the brands used in the kitchen to ensure transparency with students and the Dean.
                </Typography>
                <Grid container spacing={2}>
                   <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Rice Brand" value={brands.rice} onChange={(e) => setBrands({...brands, rice: e.target.value})} /></Grid>
                   <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Flour Brand" value={brands.flour} onChange={(e) => setBrands({...brands, flour: e.target.value})} /></Grid>
                   <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Oil Brand" value={brands.oil} onChange={(e) => setBrands({...brands, oil: e.target.value})} /></Grid>
                   <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Spices Brand" value={brands.spices} onChange={(e) => setBrands({...brands, spices: e.target.value})} /></Grid>
                   <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Ice-Cream Brand" value={brands.iceCream} onChange={(e) => setBrands({...brands, iceCream: e.target.value})} /></Grid>
                   <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Dairy Provider" value={brands.dairy} onChange={(e) => setBrands({...brands, dairy: e.target.value})} /></Grid>
                   <Grid item xs={12}><TextField size="small" fullWidth label="Quality Assurance Notes (e.g. FSSAI certified)" value={qualityNotes} onChange={(e) => setQualityNotes(e.target.value)} /></Grid>
                </Grid>
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                   <Button variant="outlined" onClick={handleSaveIngredients} sx={{ borderColor: '#6c1b85', color: '#6c1b85' }}>Update Live Ingredients</Button>
                </Box>
             </Card>
          </Grid>
        </Grid>

        <Divider style={{ borderColor: 'rgba(108,27,133,0.1)' }} />

        <MenuCalendar 
            loading={loading} 
            data={timeTableData} 
            title="Interactive Menu Editor" 
        />
      </Box>

      <Snackbar open={sneackBarInfo.open} autoHideDuration={4000} onClose={() => setSnackBarInfo({...sneackBarInfo, open: false})}>
        <Alert severity={sneackBarInfo.severity} sx={{ width: '100%' }}>{sneackBarInfo.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ManagerMenuPage;