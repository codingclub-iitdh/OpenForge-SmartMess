import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Container, Typography, Box, Grid, Button, TextField, Snackbar, Alert } from '@mui/material';
import { Card, Upload, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import VisualTimetableEditor from '../sections/manager/add-food/VisualTimetableEditor';
import { uploadMenuPdfApi, updateIngredientBrandsApi, uploadRuleBookApi } from '../utils/apis';
import '../utils/fadeAnimation.css';

const ManagerAddFood = () => {
  const [user, setUser] = useState({});
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [snackBarInfo, setSnackBarInfo] = useState({ open: false, msg: '', severity: 'success' });

  // Ingredients state
  const [brands, setBrands] = useState({ rice: '', flour: '', spices: '', iceCream: '', dairy: '', oil: '', other: '' });
  const [qualityNotes, setQualityNotes] = useState('');
  const [uploadingRuleBook, setUploadingRuleBook] = useState(false);

  const getUser = async () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const handlePdfUpload = async (file) => {
    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await uploadMenuPdfApi(formData);
      if (res?.ok) {
        setSnackBarInfo({ open: true, msg: 'Official Menu PDF uploaded and extracted successfully!', severity: 'success' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSnackBarInfo({ open: true, msg: 'Failed to upload PDF', severity: 'error' });
      }
    } catch (e) {
      setSnackBarInfo({ open: true, msg: 'Error uploading PDF', severity: 'error' });
    }
    setUploadingPdf(false);
    return false; // Prevent default form upload
  };

  const handleRuleBookUpload = async (file) => {
    setUploadingRuleBook(true);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await uploadRuleBookApi(formData);
      if (res?.ok) {
        setSnackBarInfo({ open: true, msg: 'Mess Rule Book uploaded successfully!', severity: 'success' });
      } else {
        setSnackBarInfo({ open: true, msg: 'Failed to upload Rule Book', severity: 'error' });
      }
    } catch (e) {
      setSnackBarInfo({ open: true, msg: 'Error uploading Rule Book', severity: 'error' });
    }
    setUploadingRuleBook(false);
    return false;
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

  if (user?.Role === "user") return <Navigate to="/404" />;

  return (
    <Container maxWidth="xl" sx={{ mt: -2 }}>
      <Box sx={{ height: '100%', py: 3 }}>
        <Typography variant="h3" sx={{ color: '#6c1b85', fontWeight: 800, fontFamily: "'DM Serif Display', serif", mb: 2 }}>
          Kitchen Management Suite
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* PDF UPLOAD CARD */}
          <Grid item xs={12} md={5}>
            <Card title={<Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 700 }}>Upload Official PDF Menu</Typography>} bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a monthly official menu PDF. This will be instantly visible to all students and SW Office.
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

              <Divider style={{ margin: '20px 0' }}>OR DIRECT LINK</Divider>
              <Box display="flex" gap={1}>
                <TextField size="small" fullWidth label="Paste PDF Link (Google Drive, etc.)" id="manual-pdf-url" />
                <Button variant="outlined" color="primary" sx={{ whiteSpace: 'nowrap', borderColor: '#6c1b85', color: '#6c1b85' }} onClick={async () => {
                  const url = document.getElementById('manual-pdf-url').value;
                  if (!url) return;
                  const fd = new FormData();
                  fd.append('fileUrl', url);
                  const res = await uploadMenuPdfApi(fd);
                  if (res?.ok) {
                    setSnackBarInfo({ open: true, msg: 'Manual PDF link saved successfully!', severity: 'success' });
                  } else {
                    setSnackBarInfo({ open: true, msg: 'Failed to save manual link', severity: 'error' });
                  }
                }}>
                  Save Link
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* RULE BOOK UPLOAD CARD */}
          <Grid item xs={12} md={3}>
            <Card title={<Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 700 }}>Mess Rule Book</Typography>} bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Official penalty and operational guidelines for vendors and mess staff.
              </Typography>
              <Upload
                beforeUpload={handleRuleBookUpload}
                showUploadList={false}
                accept=".pdf"
              >
                <Button
                  variant="contained"
                  startIcon={<UploadOutlined />}
                  disabled={uploadingRuleBook}
                  sx={{ bgcolor: '#2E0845', color: '#ffad4a', '&:hover': { bgcolor: '#1a0429' } }}
                >
                  {uploadingRuleBook ? 'Processing...' : 'Upload Rule Book'}
                </Button>
              </Upload>
            </Card>
          </Grid>

          {/* INGREDIENTS TRACKER CARD */}
          <Grid item xs={12} md={4}>
            <Card title={<Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 700 }}>Ingredient Quality & Brands Tracker</Typography>} bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                (Optional) Declare the brands used in the kitchen to ensure transparency with students and the Dean.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Rice Brand" value={brands.rice} onChange={(e) => setBrands({ ...brands, rice: e.target.value })} /></Grid>
                <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Flour Brand" value={brands.flour} onChange={(e) => setBrands({ ...brands, flour: e.target.value })} /></Grid>
                <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Oil Brand" value={brands.oil} onChange={(e) => setBrands({ ...brands, oil: e.target.value })} /></Grid>
                <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Spices Brand" value={brands.spices} onChange={(e) => setBrands({ ...brands, spices: e.target.value })} /></Grid>
                <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Ice-Cream Brand" value={brands.iceCream} onChange={(e) => setBrands({ ...brands, iceCream: e.target.value })} /></Grid>
                <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Dairy Provider" value={brands.dairy} onChange={(e) => setBrands({ ...brands, dairy: e.target.value })} /></Grid>
                <Grid item xs={6} sm={4}><TextField size="small" fullWidth label="Other Items" value={brands.other} onChange={(e) => setBrands({ ...brands, other: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField size="small" fullWidth label="Quality Assurance Notes (e.g. FSSAI certified)" value={qualityNotes} onChange={(e) => setQualityNotes(e.target.value)} /></Grid>
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="outlined" onClick={handleSaveIngredients} sx={{ borderColor: '#6c1b85', color: '#6c1b85' }}>Update Live Ingredients</Button>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Divider style={{ borderColor: 'rgba(108,27,133,0.1)', margin: '24px 0' }} />

        <VisualTimetableEditor />
      </Box>

      <Snackbar open={snackBarInfo.open} autoHideDuration={4000} onClose={() => setSnackBarInfo({ ...snackBarInfo, open: false })}>
        <Alert severity={snackBarInfo.severity} sx={{ width: '100%' }}>{snackBarInfo.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ManagerAddFood;

