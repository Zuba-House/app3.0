import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Box, Paper } from '@mui/material';
import { MdBlock } from 'react-icons/md';

const Unauthorized = () => {
  return (
    <Box
      className="min-h-screen flex items-center justify-center px-4"
      sx={{ bgcolor: 'background.default' }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
        <MdBlock size={56} color="#d32f2f" style={{ marginBottom: 16 }} />
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This panel is restricted to Zuba administrators. If you believe this is an error,
          contact support.
        </Typography>
        <Button component={Link} to="/login" variant="contained" color="primary" size="large">
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default Unauthorized;
