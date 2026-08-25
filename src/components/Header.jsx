import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar position="static" className="glass" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          يدرُوس
        </Typography>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography component={Link} to="/about" sx={{ mx: 2, textDecoration: 'none', color: 'inherit' }}>
            عن المنصة
          </Typography>
          <Typography component={Link} to="/contact" sx={{ mx: 2, textDecoration: 'none', color: 'inherit' }}>
            تواصل
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
