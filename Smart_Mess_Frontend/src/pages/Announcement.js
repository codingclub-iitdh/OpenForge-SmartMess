import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Grid, Card, Box, Divider, Paper } from '@mui/material';
import { Navigate } from 'react-router-dom';
import CampaignIcon from '@mui/icons-material/Campaign';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { addAnnouncementForm } from '../utils/apis';

function AnnouncementForm() {
  const [title, setTitle] = useState('');
  const [user, setUser] = useState({});
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    getUser();
  }, []);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    addAnnouncementForm({ title, description, link }).then((res) => {
      console.log(res);
      setTitle('');
      setDescription('');
      setLink('');
    });
  };

  const getUser = async () => {
    let user = localStorage.getItem('user');
    user = await JSON.parse(user);
    setUser(user);
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100%' }}>
      {user?.Role === 'user' ? (
        <Navigate to="/404" />
      ) : (
        <Box sx={{ py: 2 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ color: '#6c1b85', fontWeight: 800, fontFamily: "'DM Serif Display', serif", mb: 4 }}>
            Broadcast Announcement
          </Typography>

          <Grid container spacing={4}>
            {/* Input Form Column */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(108,27,133,0.08)', border: '1px solid rgba(108,27,133,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CampaignIcon sx={{ color: '#ffad4a', fontSize: 32, mr: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E0845' }}>Compose Message</Typography>
                </Box>
                
                <TextField
                  label="Announcement Title"
                  required
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ mb: 3 }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                
                <TextField
                  label="Detailed Message"
                  required
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ mb: 3 }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

                <TextField
                  label="Attachment Link (Optional)"
                  variant="outlined"
                  fullWidth
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  sx={{ mb: 4 }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

                <Button 
                    variant="contained" 
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!title.trim() || !description.trim()}
                    sx={{ backgroundColor: '#6c1b85', '&:hover': { backgroundColor: '#4A0E6B' }, fontWeight: 800, py: 1.5, fontSize: '1.05rem', borderRadius: 2, boxShadow: '0 8px 24px rgba(108,27,133,0.24)', textTransform: 'none' }}
                >
                  Publish Broadcast
                </Button>
              </Card>
            </Grid>

            {/* Live Preview Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="overline" sx={{ color: '#919EAB', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                  Live Student Preview
                </Typography>
                
                <Paper sx={{ flex: 1, p: 4, borderRadius: 4, bgcolor: '#F4F6F8', border: '1px dashed rgba(145, 158, 171, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {title || description ? (
                        <Card sx={{ width: '100%', maxWidth: 480, mt: 2, borderRadius: 3, overflow: 'hidden', boxShadow: '0 12px 24px -4px rgba(108,27,133,0.1)' }}>
                            <Box sx={{ height: 6, bgcolor: '#ffad4a', width: '100%' }} />
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#2E0845', mb: 1, fontFamily: "'DM Serif Display', serif" }}>
                                    {title || 'Untitled Announcement'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#919EAB', display: 'block', mb: 2 }}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • Official Broadcast
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body2" sx={{ color: '#637381', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                    {description || 'Message description will appear here...'}
                                </Typography>
                                
                                {link && (
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        startIcon={<OpenInNewIcon />}
                                        sx={{ mt: 3, borderRadius: 8, borderColor: 'rgba(108,27,133,0.3)', color: '#6c1b85' }}
                                    >
                                        View Attachment
                                    </Button>
                                )}
                            </Box>
                        </Card>
                    ) : (
                        <Box sx={{ m: 'auto', textAlign: 'center', opacity: 0.5 }}>
                            <CampaignIcon sx={{ fontSize: 64, color: '#919EAB', mb: 2 }} />
                            <Typography variant="body1" sx={{ color: '#919EAB' }}>
                                Start typing to see a preview of how students will view this post.
                            </Typography>
                        </Box>
                    )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default AnnouncementForm;
