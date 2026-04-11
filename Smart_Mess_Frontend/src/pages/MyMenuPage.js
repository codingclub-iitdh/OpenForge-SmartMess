import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, Grid, Stack, Divider } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Card } from 'antd';
import { getDashTimeTable, getMenuPdfApi, getIngredientBrandsApi } from '../utils/apis';
import MenuCalendar from '../sections/menu/MenuCalendar';

const MyMenuPage = () => {
  const [timeTableData, setTimeTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [ruleBookUrl, setRuleBookUrl] = useState(null);
  const [ingredients, setIngredients] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ttRes, pdfRes, ingRes] = await Promise.all([
         getDashTimeTable(),
         getMenuPdfApi(),
         getIngredientBrandsApi()
      ]);
      if (ttRes?.length) setTimeTableData(ttRes);
      if (pdfRes?.pdfUrl) setPdfUrl(pdfRes.pdfUrl);
      if (pdfRes?.ruleBookUrl) setRuleBookUrl(pdfRes.ruleBookUrl);
      if (ingRes) setIngredients(ingRes);
    } catch (error) {
      console.error("Error fetching menu page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <Container maxWidth="xl">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-menu, .printable-menu * { visibility: visible; }
          .printable-menu { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      <Box sx={{ py: 2 }}>
        
        {/* NEW FEATURES SECTION */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* PDF VIEW CARD */}
          <Grid item xs={12} md={4}>
            <Card title={<Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 700 }}>Official PDF Menu</Typography>} bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
               {pdfUrl ? (
                 <Stack spacing={2} alignItems="flex-start">
                   <Typography variant="body2" color="text.secondary">
                     View the verified monthly menu uploaded by your mess manager.
                   </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<PictureAsPdfIcon />} 
                      component="a"
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ bgcolor: '#ffad4a', color: '#2E0845', '&:hover': { bgcolor: '#e89520' }, borderRadius: 2, width: '100%', justifyContent: 'flex-start' }}
                    >
                      Monthly Menu PDF
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      startIcon={<PictureAsPdfIcon />} 
                      onClick={handleDownloadPdf}
                      sx={{ borderColor: '#2E0845', color: '#2E0845', '&:hover': { borderColor: '#6c1b85', bgcolor: 'rgba(108,27,133,0.05)' }, borderRadius: 2, width: '100%', justifyContent: 'flex-start' }}
                    >
                      Download Current Schedule (PDF)
                    </Button>

                    {ruleBookUrl && (
                      <Button 
                        variant="outlined" 
                        startIcon={<PictureAsPdfIcon />} 
                        component="a"
                        href={ruleBookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ borderColor: '#2E0845', color: '#2E0845', '&:hover': { borderColor: '#6c1b85', bgcolor: 'rgba(108,27,133,0.05)' }, borderRadius: 2, width: '100%', justifyContent: 'flex-start' }}
                      >
                        Official Rule Book
                      </Button>
                    )}
                 </Stack>
               ) : (
                 <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No official PDF document has been uploaded for your mess yet.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<PictureAsPdfIcon />} 
                      onClick={handleDownloadPdf}
                      sx={{ borderColor: '#2E0845', color: '#2E0845', '&:hover': { borderColor: '#6c1b85', bgcolor: 'rgba(108,27,133,0.05)' }, borderRadius: 2, width: '100%', justifyContent: 'flex-start' }}
                    >
                      Download Current Schedule (PDF)
                    </Button>
                 </Stack>
               )}
            </Card>
          </Grid>
          
          {/* INGREDIENTS TRACKER CARD */}
          <Grid item xs={12} md={8}>
             <Card title={<Typography variant="h6" sx={{ color: '#6c1b85', fontWeight: 700 }}>Ingredient Transparency</Typography>} bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {ingredients ? (
                  <Grid container spacing={2}>
                     <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Rice Brand</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{ingredients.brands?.rice || '--'}</Typography>
                     </Grid>
                     <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Flour Brand</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{ingredients.brands?.flour || '--'}</Typography>
                     </Grid>
                     <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Oil Brand</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{ingredients.brands?.oil || '--'}</Typography>
                     </Grid>
                     <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Spices Brand</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{ingredients.brands?.spices || '--'}</Typography>
                     </Grid>
                     <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Ice-Cream</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{ingredients.brands?.iceCream || '--'}</Typography>
                     </Grid>
                     <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Dairy Provider</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{ingredients.brands?.dairy || '--'}</Typography>
                     </Grid>
                     <Grid item xs={6} sm={4}>
                        <Typography variant="caption" color="text.secondary">Other Brands</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{ingredients.brands?.other || '--'}</Typography>
                     </Grid>
                     {ingredients.qualityNotes && (
                       <Grid item xs={12} sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">Manager's Quality Notes</Typography>
                          <Typography variant="body2" sx={{ bgcolor: 'rgba(255,173,74,0.1)', p: 1.5, borderRadius: 2, borderLeft: '4px solid #ffad4a' }}>
                            {ingredients.qualityNotes}
                          </Typography>
                       </Grid>
                     )}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Ingredients quality information has not been published by your manager.
                  </Typography>
                )}
             </Card>
          </Grid>
        </Grid>

        <Divider style={{ borderColor: 'rgba(108,27,133,0.1)' }} />

        <Box className="printable-menu">
            <MenuCalendar 
                loading={loading} 
                data={timeTableData} 
                title="Current Mess Menu" 
            />
        </Box>
      </Box>
    </Container>
  );
};

export default MyMenuPage;
