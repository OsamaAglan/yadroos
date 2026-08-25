import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <AppBar position="static" component="footer" className="glass" sx={{ top: 'auto', bottom: 0, backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', mt: 4 }}>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            الصفحة الرئيسية
          </Typography>
          <Typography component={Link} to="/privacy" sx={{ textDecoration: 'none', color: 'inherit' }}>
            سياسة الخصوصية
          </Typography>
          <Typography component={Link} to="/terms" sx={{ textDecoration: 'none', color: 'inherit' }}>
            الشروط والأحكام
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ ml: 2 }}>
          © 2024 يدرُوس. جميع الحقوق محفوظة.
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;
